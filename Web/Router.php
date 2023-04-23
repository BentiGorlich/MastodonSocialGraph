<?php
namespace Common;

use Attributes\Controller;
use Attributes\FromBody;
use Attributes\FromQuery;
use Attributes\FromRoute;
use Attributes\Route;
use Exception;
use ReflectionAttribute;
use ReflectionClass;
use ReflectionException;
use ReflectionMethod;
use ReflectionNamedType;
use ReflectionParameter;
use StdClass;

class Router
{
    private static array $routes     = array();
    /**
     * @var callable
     */
    private static  $pathNotFound    = null;
    /**
     * @var callable
     */
    private static $methodNotAllowed = null;

    /**
     * Function used to add a new route
     * @param string $expression Route string or expression
     * @param callable $function Function to call when route with allowed method is found
     * @param string|string[] $method Either a string of allowed method or an array with string values
     *
     */
    public static function add(string $expression, callable $function, string|array $method = 'get'): void
    {
        self::$routes[] = array(
            'expression' => $expression,
            'function' => $function,
            'method' => $method,
        );
    }

    /**
     * @throws ReflectionException
     * @throws Exception when the controller has a method with more than one parameter with FromBody attribute
     */
    public static function addController(object|string $controller): void
    {
        $refClass = new ReflectionClass($controller);
        $basePath = "";
        $isAPI = false;
        foreach($refClass->getAttributes(Controller::class) as $attribute) {
            /** @var Controller $cAtt */
            $cAtt = $attribute->newInstance();
            $basePath = $cAtt->basePath;
            $isAPI = $cAtt->isAPI;
        }
        foreach($refClass->getMethods() as $method) {
            foreach ($method->getAttributes(Route::class, ReflectionAttribute::IS_INSTANCEOF) as $attribute) {
                /** @var Route $rAtt */
                $rAtt = $attribute->newInstance();
                $bodyParams = [];
                $queryParams = [];
                $routeParams = [];
                foreach($method->getParameters() as $parameter) {
                    $fromBody = false;
                    $fromRoute = false;
                    $fromQuery = false;
                    foreach($parameter->getAttributes() as $paraAtt) {
                        switch ($paraAtt->getName()) {
                            case FromBody::class:
                                $fromBody = true;
                                break;
                            case FromQuery::class:
                                $fromQuery = true;
                                break;
                            case FromRoute::class:
                                $fromRoute = true;
                                break;
                        }
                    }
                    if($fromRoute) {
                        $routeParams[] = $parameter;
                    } else if($fromBody) {
                        $bodyParams[] = $parameter;
                    } else if ($fromQuery) {
                        $queryParams[] = $parameter;
                    }
                }
                if(sizeof($bodyParams) > 1) {
                    throw new Exception("each controller method can only have one argument from body");
                }

                if(!str_starts_with($basePath, "/") and $basePath != "")
                    $path = "/$basePath";
                else
                    $path = $basePath;

                if($rAtt->path != "") {
                    if($rAtt->path != "/" and $basePath != "/")
                        $path .= "/";
                    $path .= $rAtt->path;
                }

                if(sizeof($routeParams) == 0) {
                    self::add("$path", function () use ($method, $queryParams, $bodyParams, $routeParams, $rAtt, $isAPI) {
                        self::CallControllerMethod($method, $bodyParams, $queryParams, $routeParams, [], $rAtt->needLogin, $rAtt->needAdmin, $isAPI );
                    }, $rAtt->method);
                } else if(sizeof($routeParams) == 1) {
                    self::add("$path", function ($a = null) use ($method, $queryParams, $bodyParams, $routeParams, $rAtt, $isAPI) {
                        self::CallControllerMethod($method, $bodyParams, $queryParams, $routeParams, [$a], $rAtt->needLogin, $rAtt->needAdmin, $isAPI);
                    }, $rAtt->method);
                } else if(sizeof($routeParams) == 2) {
                    self::add("$path", function ($a = null, $b = null) use ($method, $queryParams, $bodyParams, $routeParams, $rAtt, $isAPI) {
                        self::CallControllerMethod($method, $bodyParams, $queryParams, $routeParams, [$a, $b], $rAtt->needLogin, $rAtt->needAdmin, $isAPI);
                    }, $rAtt->method);
                } else if(sizeof($routeParams) == 3) {
                    self::add("$path", function ($a = null, $b = null, $c = null) use ($method, $queryParams, $bodyParams, $routeParams, $rAtt, $isAPI) {
                        self::CallControllerMethod($method, $bodyParams, $queryParams, $routeParams, [$a, $b, $c], $rAtt->needLogin,$rAtt->needAdmin, $isAPI);
                    }, $rAtt->method);
                } else {
                    throw new Exception("more than 3 route parameters are not supported");
                }
            }
        }
    }

    /**
     * @param ReflectionMethod $method
     * @param ReflectionParameter[] $bodyParams
     * @param ReflectionParameter[] $queryParams
     * @param ReflectionParameter[] $routeParams
     * @param string[] $routeValues
     * @param bool $needLogin
     * @param bool $needAdmin
     * @return void
     * @throws ReflectionException|Exception
     */
    private static function CallControllerMethod(ReflectionMethod $method, array $bodyParams, array $queryParams, array $routeParams, array $routeValues, bool $needLogin, bool $needAdmin, bool $isAPI): void
    {
        if($isAPI)
            header("Content-Type: application/json");
        $bodyValues = [];
        if(sizeof($bodyParams) == 1) {
            $entityBody = file_get_contents('php://input');
            $para = $bodyParams[0];
            $type = $para->getType();
            $bodyValues[] = json_decode_object_from_string($entityBody, $type->getName());
        }

        $queryValues = [];
        foreach ($queryParams as $param) {
            if(isset($_GET[$param->getName()])) {
                $value = $_GET[$param->getName()];
                $type = $param->getType();
                if($type instanceof ReflectionNamedType) {
                    $queryValues[] = match ($type->getName()) {
                        "int" => intval($value),
                        "float" => floatval($value),
                        "string" => $value,
                        "bool" => (bool)$value,
                        default => throw new Exception("the type " . $type->getName() . " is not supported in a query parameter"),
                    };
                }
            }
        }

        $values = [];
        for ($i = 0; $i<sizeof($bodyParams); $i++) {
            $values[$bodyParams[$i]->getPosition()] = $bodyValues[$i];
        }
        for($i = 0; $i<sizeof($queryParams); $i++) {
            $values[$queryParams[$i]->getPosition()] = $queryValues[$i];
        }
        for($i = 0; $i<sizeof($routeParams); $i++) {
            $values[$routeParams[$i]->getPosition()] = $routeValues[$i];
        }

        $method->invokeArgs($method->getDeclaringClass()->newInstance(), $values);
    }

    public static function pathNotFound(callable $function): void
    {
        self::$pathNotFound = $function;
    }

    public static function methodNotAllowed($function): void
    {
        self::$methodNotAllowed = $function;
    }

    public static function run(string $basepath = '/', bool $case_matters = false, bool $trailing_slash_matters = false): void
    {
        // Parse current url
        $parsed_url = parse_url($_SERVER['REQUEST_URI']); //Parse Uri
        if (isset($parsed_url['path']) && $parsed_url['path'] != '/') {
            if ($trailing_slash_matters) {
                $path = $parsed_url['path'];
            } else {
                $path = rtrim($parsed_url['path'], '/');
            }
        } else {
            $path = '/';
        }
        // Get current request method
        $method            = $_SERVER['REQUEST_METHOD'];
        $path_match_found  = false;
        $route_match_found = false;
        foreach (self::$routes as $route) {
            // If the method matches check the path
            // Add basepath to matching string
            if ($basepath != '' && $basepath != '/') {
                $route['expression'] = '(' . $basepath . ')' . $route['expression'];
            }
            // Add 'find string start' automatically
            $route['expression'] = '^' . $route['expression'];
            // Add 'find string end' automatically
            $route['expression'] = $route['expression'] . '$';
            // echo $route['expression'].'<br/>';
            // Check path match
            if (preg_match('#' . $route['expression'] . '#' . ($case_matters ? '' : 'i'), $path, $matches)) {
                $path_match_found = true;
                // Cast allowed method to array if it's not one already, then run through all methods
                foreach ((array) $route['method'] as $allowedMethod) {
                    // Check method match
                    if (strtolower($method) == strtolower($allowedMethod)) {
                        array_shift($matches); // Always remove first element. This contains the whole string
                        if ($basepath != '' && $basepath != '/') {
                            array_shift($matches); // Remove basepath
                        }
                        try {
                            call_user_func_array($route['function'], $matches);
                        } catch(Exception $ex) {
                            http_response_code(500);
                            if(in_array("Content-Type: application/json", headers_list())) {
                                $error = new StdClass();
                                $error->error = $ex->getMessage();
                                echo json_encode($error);
                            } else {
                                echo $ex->getMessage();
                                print_r(headers_list());
                            }
                        }
                        $route_match_found = true;
                        // Do not check other routes
                        break;
                    }
                }
            }
        }
        // No matching route was found
        if (!$route_match_found) {
            // But a matching path exists
            if ($path_match_found) {
                header("HTTP/1.0 405 Method Not Allowed");
                if (self::$methodNotAllowed) {
                    call_user_func_array(self::$methodNotAllowed, array($path, $method));
                }
            } else {
                header("HTTP/1.0 404 Not Found");
                if (self::$pathNotFound) {
                    call_user_func_array(self::$pathNotFound, array($path));
                }
            }
        }
    }
}
