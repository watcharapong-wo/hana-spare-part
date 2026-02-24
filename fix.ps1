Copy-Item .\index.js .\index.js.bak -Force

$lines = Get-Content .\index.js
$out = @()

foreach ($l in $lines) {
  $t = $l.TrimEnd()
  if ($t -eq "const { connect } = require('./database/mssql');") {
    $out += "// " + $t
  }
  elseif ($t -eq "connect();") {
    $out += "// " + $t
  }
  else {
    $out += $l
  }
}

Set-Content -Path .\index.js -Value $out -Encoding UTF8
Get-Content .\index.js -TotalCount 5
