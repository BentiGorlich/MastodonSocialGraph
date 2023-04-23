<?php

namespace Sites;

use Attributes\Controller;
use Attributes\Route;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Exception\CommonMarkException;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\DescriptionList\DescriptionListExtension;
use League\CommonMark\Extension\Footnote\FootnoteExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\SmartPunct\SmartPunctExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\Extension\TableOfContents\TableOfContentsExtension;
use League\CommonMark\Extension\TaskList\TaskListExtension;
use League\CommonMark\MarkdownConverter;

#[Controller("site")]
class SiteController
{
    #[Route("about", ["get"])]
    public function About(): void
    {
        \Frame::ConstructSite($this->MakeMarkdownSite("./Sites/About.md"), "About", true, false);
    }

    private function MakeMarkdownSite(string $mdFilePath): string
    {
        if(!file_exists($mdFilePath))
            die ("The file $mdFilePath doesn't exist");

        $mdContent = file_get_contents($mdFilePath);
        $fileName = basename($mdFilePath, ".md");
        $config = [
            'heading_permalink' => [
                'id_prefix' => $fileName,
                'apply_id_to_heading' => true,
                'fragment_prefix' => $fileName,
                'title' => 'Link'
            ],
            'allow_unsafe_links' => false
        ];
        $environment = new Environment($config);
        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new TableExtension());
        $environment->addExtension(new SmartPunctExtension());
        $environment->addExtension(new DescriptionListExtension());
        $environment->addExtension(new FootnoteExtension());
        $environment->addExtension(new TaskListExtension());
        $environment->addExtension(new TableOfContentsExtension());
        $environment->addExtension(new HeadingPermalinkExtension());
        $converter = new MarkdownConverter($environment);
        try {
            return $converter->convert($mdContent);
        } catch (CommonMarkException $e) {
            return $e->getCode() . ": " . $e->getMessage();
        }
    }
}