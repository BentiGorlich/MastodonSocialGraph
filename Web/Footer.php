<?php

class Footer
{
    public function __toString(): string
    {
        $lang = $_SESSION['lang'] ?? "en";
        $erg = "<footer><script>const lang=\"$lang\";</script>" .
            '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.7/dist/umd/popper.min.js" integrity="sha384-zYPOMqeu1DAVkHiLqWBUTcbYfZ8osu1Nd6Z89ify25QV9guujx43ITvfi12/QExE" crossorigin="anonymous"></script>' .
            '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.min.js" integrity="sha384-Y4oOpwW3duJdCWv5ly8SCFYWqFDsfob/3GkgExXKV4idmbt98QcxXYs9UoXAB7BZ" crossorigin="anonymous"></script>' .
            "<script src='/static/JS/Main.js'></script>" .
        "</footer>";
        if (isset($GLOBALS['script']) and $GLOBALS['script'] != "") {
            $erg .= "<script>" . $GLOBALS['script'] . "</script>";
        }
        if (isset($GLOBALS['scriptsrc'])) {
            foreach ($GLOBALS['scriptsrc'] as $source) {
                $compiledSrc = $source . "?version=" . $GLOBALS['version'];
                $erg .= "<script src='$compiledSrc'></script>";
            }
        }
        return $erg;
    }
}
