cmd /c npm list download-cli -g || npm install -g download-cli
cmd /c IF NOT EXIST grunt-config\custom-tasks\rat\_extern-tools\apache-rat-0.12 download "https://archive.apache.org/dist/creadur/apache-rat-0.12/apache-rat-0.12-bin.zip" --extract --out "grunt-config\custom-tasks\rat\_extern-tools"
call npm install
call grunt release
call npm pack