<?php
if(isset($_POST['url'])) {
    $url = $_POST['url'];
    
    // Lädt die URL direkt
    $response = file_get_contents($url);
    
    // Anpassen der Links auf der Seite, damit sie über den Proxy laufen
    $response = str_replace('href="', 'href="' . htmlspecialchars($_SERVER['PHP_SELF']) . '?url=', $response);
    $response = str_replace('src="', 'src="' . htmlspecialchars($_SERVER['PHP_SELF']) . '?url=', $response);
    
    // Übermittelt Cookies an die nächste Anfrage
    $cookies = array();
    foreach ($_COOKIE as $key => $value) {
        $cookies[] = $key . '=' . $value;
    }
    $cookie_str = implode('; ', $cookies);
    
    // Gibt die HTML-Antwort mit Cookies aus
    echo $response;
    
    exit(); // Beendet das Skript nach dem Laden der Seite, um keine zusätzlichen Inhalte zu laden
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy Unblocker</title>
</head>
<body>
    <form method="post">
        <input type="text" name="url" placeholder="Enter URL">
        <button type="submit">GO</button>
    </form>
</body>
</html>
