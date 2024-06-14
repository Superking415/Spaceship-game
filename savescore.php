<?php
$servername = "localhost";
$username = "root";
$password = " ";
$dbname = "retrogame";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
}

$sql = "INSERT INTO scores (userID, Scores, Date) VALUES (1," . $_POST['score'] . ", NOW())";
if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
        header('Location: ' . $_SERVER['HTTP_REFERER']); 
} else {
        echo "Error: " . $sql . "<br>" . $conn->error;
}
$sql = "SELECT SUM(Scores) as totalScore FROM scores WHERE ID = " . $_POST['userID'];
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo $row["totalScore"];
    }
} else {
    echo "0";
}
$conn->close();
?>