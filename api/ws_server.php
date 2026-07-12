<?php
// Set execution timeout to infinite
set_time_limit(0);
ob_implicit_flush();

$host = '127.0.0.1';
$port = 8090;

// Create a stream socket server
$server = stream_socket_server("tcp://$host:$port", $errno, $errstr);

if (!$server) {
    die("Could not create stream socket server: $errstr ($errno)\n");
}

echo "WebSocket Server running on ws://$host:$port\n";

$sockets = [$server];
$clients = []; // maps socket ID to details: ['socket', 'handshake' => bool, 'client_id' => int]

function perform_handshake($clientSocket, $headers) {
    if (preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $headers, $match)) {
        $key = trim($match[1]);
        $accept = base64_encode(sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', true));
        
        $response = "HTTP/1.1 101 Switching Protocols\r\n" .
                    "Upgrade: websocket\r\n" .
                    "Connection: Upgrade\r\n" .
                    "Sec-WebSocket-Accept: $accept\r\n\r\n";
        
        fwrite($clientSocket, $response);
        return true;
    }
    return false;
}

function decode_frame($data) {
    if (strlen($data) < 2) return null;
    $length = ord($data[1]) & 127;
    
    if ($length == 126) {
        $masks = substr($data, 4, 4);
        $payload = substr($data, 8);
    } elseif ($length == 127) {
        $masks = substr($data, 10, 4);
        $payload = substr($data, 14);
    } else {
        $masks = substr($data, 2, 4);
        $payload = substr($data, 6);
    }
    
    $text = "";
    $masksLength = strlen($masks);
    $payloadLength = strlen($payload);
    
    if ($masksLength === 4) {
        for ($i = 0; $i < $payloadLength; ++$i) {
            $text .= $payload[$i] ^ $masks[$i % 4];
        }
        return $text;
    }
    return $payload; // unmasked
}

function encode_frame($text) {
    $b1 = 0x80 | (0x1 & 0x0f); // FIN + Text frame
    $length = strlen($text);
    
    if ($length <= 125) {
        $header = pack('CC', $b1, $length);
    } elseif ($length > 125 && $length < 65536) {
        $header = pack('CCn', $b1, 126, $length);
    } else {
        $header = pack('CCN', $b1, 127, $length); // 32-bit length fallback
    }
    return $header . $text;
}

// Socket Loop
while (true) {
    $read = $sockets;
    $write = NULL;
    $except = NULL;
    
    // Select sockets with activity
    if (stream_select($read, $write, $except, 10) > 0) {
        
        // Handle new connection
        if (in_array($server, $read)) {
            $newClient = stream_socket_accept($server);
            if ($newClient) {
                $socketId = (int)$newClient;
                $sockets[] = $newClient;
                $clients[$socketId] = [
                    'socket' => $newClient,
                    'handshake' => false,
                    'client_id' => 0
                ];
                echo "New connection opened: Socket ID $socketId\n";
            }
            // Remove server socket from read list
            $key = array_search($server, $read);
            unset($read[$key]);
        }
        
        // Handle incoming data from clients
        foreach ($read as $readSocket) {
            $socketId = (int)$readSocket;
            $data = fread($readSocket, 4096);
            
            if (empty($data)) {
                // Client closed connection
                echo "Connection closed: Socket ID $socketId\n";
                fclose($readSocket);
                unset($clients[$socketId]);
                $key = array_search($readSocket, $sockets);
                if ($key !== false) unset($sockets[$key]);
                continue;
            }
            
            $client = &$clients[$socketId];
            
            // Check for Local Broadcast Trigger
            if (strpos($data, "BROADCAST_JSON:") === 0) {
                $jsonStr = substr($data, 15);
                $payload = json_decode(trim($jsonStr), true);
                
                if ($payload && isset($payload['client_id'])) {
                    $targetClientId = intval($payload['client_id']);
                    echo "Broadcasting notification to Client ID: $targetClientId\n";
                    
                    // Broadcast to all matching WebSocket clients
                    foreach ($clients as $cId => $c) {
                        if ($c['handshake'] && $c['client_id'] === $targetClientId) {
                            @fwrite($c['socket'], encode_frame(json_encode($payload)));
                        }
                    }
                }
                
                // Close the local broadcast trigger connection
                fclose($readSocket);
                unset($clients[$socketId]);
                $key = array_search($readSocket, $sockets);
                if ($key !== false) unset($sockets[$key]);
                continue;
            }
            
            // Handle Handshake
            if (!$client['handshake']) {
                if (perform_handshake($readSocket, $data)) {
                    $client['handshake'] = true;
                    echo "Handshake completed for Socket ID $socketId\n";
                } else {
                    echo "Invalid handshake request on Socket ID $socketId. Closing.\n";
                    fclose($readSocket);
                    unset($clients[$socketId]);
                    $key = array_search($readSocket, $sockets);
                    if ($key !== false) unset($sockets[$key]);
                }
            } else {
                // Handle WebSocket Frame Data
                $decoded = decode_frame($data);
                if ($decoded) {
                    $payload = json_decode($decoded, true);
                    if ($payload && isset($payload['type'])) {
                        if ($payload['type'] === 'register') {
                            $client['client_id'] = intval($payload['client_id']);
                            echo "Registered Socket ID $socketId for Client ID: {$client['client_id']}\n";
                            
                            // Send positive response
                            $ack = json_encode(["type" => "registered", "success" => true]);
                            @fwrite($readSocket, encode_frame($ack));
                        }
                    }
                }
            }
        }
    }
}
