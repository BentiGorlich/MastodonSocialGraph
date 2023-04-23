<?php

namespace Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class JsonArrayClass
{
    public string $className;

    public function __construct(string $className)
    {
        $this->className = $className;
    }
}