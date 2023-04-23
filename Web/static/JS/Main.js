function tr(english, german) {
    switch(lang ?? "en") {
        default:
        case "en":
            return english;
        case "de":
            return german ?? english;
    }
}