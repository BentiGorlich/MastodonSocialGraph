<?php

namespace Sites;

use Attributes\Controller;
use Attributes\Route;
use Frame;
use Helpers;

#[Controller("/")]
class HomeController
{
    #[Route("", ["get"])]
    public function GetHome(): void
    {
        $GLOBALS['scriptsrc'][] = "/static/JS/dist/frontend/HomeWrapper.js";
        Frame::ConstructSite("<div id='home-root' />", "", false, false);
    }
}