<?php

namespace Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Required
{
    public bool $emptyAllowed;

    public function __construct(bool $emptyAllowed = false)
    {
        $this->emptyAllowed = $emptyAllowed;
    }
}