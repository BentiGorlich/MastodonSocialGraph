<?php
if (!session_id()) {
    @session_start();
}

if (file_exists("config.php"))
    require("config.php");

if($GLOBALS['debug'])
    error_reporting(E_ALL);

use Attributes\JsonArrayClass;
use Attributes\JsonProperty;
use Attributes\Required;
use \Common\Router;
use Sites\Errors\E404;
use Sites\HomeController;
use Sites\SiteController;

include_once "Router.php";
include_once "vendor/autoload.php";
spl_autoload_register('ClassLoader');

$GLOBALS['version'] = "0.1.0";

if (!isset($GLOBALS['script']))
    $GLOBALS['script'] = "";
if (!isset($GLOBALS['scriptsrc']))
    $GLOBALS['scriptsrc'] = array();
if (!isset($GLOBALS['stylesrc']))
    $GLOBALS['stylesrc'] = array();

foreach (GetController() as $c) {
    Router::addController($c);
}

Router::pathNotFound(function () {
    Frame::ConstructSite((new E404())->__toString(), "Seite nicht gefunden");
});
Router::run("/", true, false);

function GetController(): array
{
    return [
        HomeController::class,
        SiteController::class
    ];
}

function BackToHome(): void
{
    if (isset($_GET['from'])) {
        header("Location: " . $_GET['from']);
    } else {
        header("Location: " . $GLOBALS['root_dir']);
    }
}

function ClassLoader($class): void
{
    $sep = DIRECTORY_SEPARATOR;
    $file = $class . '.php';
    $file = str_replace("\\", $sep, $file);
    // echo "<p>$file</p>";
    if (file_exists($file)) {
        require $file;
    }
}

/**
 * @param string $content the json that should be decoded
 * @param string $class the class which should be returned
 * @param bool $nestedInArray whether the input is an array of $class
 * @return mixed an instance of $class or an array of $class if $nestedInArray
 * @throws ReflectionException|Exception
 */
function json_decode_object_from_string(string $content, string $class, bool $nestedInArray = false): mixed
{
    $json = json_decode($content);
    if($nestedInArray and !is_array($json))
        throw new Exception("content is not an array!");

    if(!$nestedInArray)
        $json = [$json];

    if(class_exists($class)) {
        $result = [];
        foreach ($json as $jsonItem) {
            $result[] = json_decode_object($jsonItem, $class);
        }
        if($nestedInArray)
            return $result;
        else
            return $result[0];
    } else {
        throw new Exception("there is not class with the name $class");
    }
}

/**
 * @throws ReflectionException
 * @throws Exception
 */
function json_decode_object($jsonItem, $class)
{
    $argument = new ($class);
    $argumentClass = new ReflectionClass($argument::class);
    $jsonObjects = get_object_vars($jsonItem);
    foreach ($argumentClass->getProperties(ReflectionProperty::IS_PUBLIC) as $property) {
        $propertyName = $property->name;
        $jsonName = $propertyName;
        $required = false;
        $canBeEmpty = true;
        $value = null;
        $arrayClass = null;
        foreach ($property->getAttributes() as $propAtt) {
            if ($propAtt->getName() == Required::class) {
                /** @var Required $reqAtt */
                $reqAtt = $propAtt->newInstance();
                $required = true;
                $canBeEmpty = $reqAtt->emptyAllowed;
            } else if ($propAtt->getName() == JsonProperty::class) {
                /** @var JsonProperty $jsonPropertyAtt */
                $jsonPropertyAtt = $propAtt->newInstance();
                $jsonName = $jsonPropertyAtt->name;
            }else if ($propAtt->getName() == JsonArrayClass::class) {
                /** @var JsonArrayClass $jsonPropertyAtt */
                $jsonPropertyAtt = $propAtt->newInstance();
                $arrayClass = $jsonPropertyAtt->className;
            }
        }
        if (array_key_exists($jsonName, $jsonObjects)) {
            if($property->getType()->isBuiltin()) {
                $argument->$propertyName = $jsonObjects[$jsonName];
                if (is_array($argument->$propertyName) and $arrayClass != null) {
                    $arr = $argument->$propertyName;
                    $argument->$propertyName = [];
                    foreach ($arr as $item) {
                        $argument->$propertyName[] = json_decode_object($item, $arrayClass);
                    }
                }
            } else {
                $argument->$propertyName = json_decode_object($jsonObjects[$jsonName], $property->getType()->getName());
            }
            if ($required and !$canBeEmpty and $argument->$propertyName == "")
                throw new Exception("$propertyName is required, but empty");
        } else if ($required) {
            throw new Exception("$propertyName is required, but missing from the input");
        }
    }
    return $argument;
}
