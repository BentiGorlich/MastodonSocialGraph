<?php

namespace Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class JsonProperty
{
    public string $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }
}