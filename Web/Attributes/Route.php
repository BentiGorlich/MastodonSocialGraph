<?php

namespace Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Route
{
    public string $path;
    /**
     * @var string[]
     */
    public array $method;
    public bool $needLogin;
    public bool $needAdmin;

    /**
     * @param string $path
     * @param string[] $method
     * @param bool $needLogin
     * @param bool $needAdmin
     */
    public function __construct(string $path, array $method, bool $needLogin = false, bool $needAdmin = false)
    {
        $this->path = $path;
        $this->method = $method;
        $this->needLogin = $needLogin;
        $this->needAdmin = $needAdmin;
    }
}