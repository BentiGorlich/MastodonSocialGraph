<?php

class Frame
{
    /**
     * @var Footer
     */
    public Footer $Footer;

    /**
     * @var string
     */
    public string $Content;

    /**
     * @var string
     */
    public string $Title;

    public bool $SmallContent = true;

    public bool $ContentWhite = true;

    public function __construct($title)
    {
        if (isset($GLOBALS['site_name'])) {
            if ( $title != "")
                $this->Title = $GLOBALS['site_name'] . " - " . $title;
            else
                $this->Title = $GLOBALS['site_name'];
        } else {
            $this->Title = $title;
        }
    }

    public function __toString()
    {
        if (isset($this->Footer) and isset($this->Content)) {
            $maxWidth = $this->SmallContent ? "max-width: 1000px;" : "";
            $sources = "";
            if (isset($GLOBALS['scriptsrc'])) {
                foreach ($GLOBALS['stylesrc'] as $source) {
                    $sources .= "<link rel='stylesheet' href='$source?version={$GLOBALS['version']}''>";
                }
            }
            return "<!DOCTYPE html><html><head><title>$this->Title</title>" .
                '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">' .
                "<link rel='stylesheet' href='/static/main.css?version={$GLOBALS['version']}'>" .
                '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.4/font/bootstrap-icons.css">' .
                '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />' .
                $sources .
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" .
                "</head><body><main><div class='col-12' style='" . ($this->ContentWhite ? "background-color: var(--content-bg);" : "") . " padding: 0 1rem 0 1rem; margin: auto; $maxWidth'>$this->Content</div></main>" . $this->Footer;
        } else {
            throw new \Exception("Not all required variables are set!");
        }
    }

    public static function ConstructSite($content, string $title, bool $smallContent = true, bool $makeFrameWhite = true): void
    {
        $frame = new Frame($title);
        $frame->SmallContent = $smallContent;
        $frame->ContentWhite = $makeFrameWhite;
        $frame->Footer = new Footer();
        $frame->Content = $content;
        echo $frame->__toString();
    }
}