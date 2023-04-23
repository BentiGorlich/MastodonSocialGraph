<?php
	
namespace Sites\Errors;

use HTML\Col;
use HTML\Row;

class E404
{
    public function __toString()
    {
        return (new Row(new Col("<h1>Die aufgerufene Seite existiert nicht!</h1>")))->__toString();
    }
}