<?php

namespace Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Controller
{
    public string $basePath;
    public bool $isAPI;

    public function __construct(string $basePath, bool $isAPI = false)
    {
        $this->basePath = $basePath;
        $this->isAPI = $isAPI;
    }
}