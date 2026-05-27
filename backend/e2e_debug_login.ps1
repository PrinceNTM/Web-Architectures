$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"e2e+test@example.com","password":"password123"}' -WebSession $session -UseBasicParsing -Verbose -ErrorAction Stop
  Write-Output "Status: $($resp.StatusCode.Value__)"
  Write-Output "Headers:"
  $resp.Headers | Format-List
  Write-Output "Cookies:"
  $session.Cookies.GetCookies('http://localhost:3000') | ConvertTo-Json
} catch {
  Write-Output "Error: $_"
  if ($_.Exception.Response) {
    Write-Output "Response Status: $($_.Exception.Response.StatusCode.Value__)"
    Write-Output "Response Headers:"
    $_.Exception.Response.Headers | Format-List
    try { $_.Exception.Response.GetResponseStream() | Select-Object -First 1 } catch {}
  }
}
