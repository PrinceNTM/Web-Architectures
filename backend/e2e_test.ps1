$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$suffix = [guid]::NewGuid().ToString('N').Substring(0, 8)
$email = "e2e+$suffix@example.com"
$password = "StrongPass!$suffix"

Write-Output "Health:"
try {
  Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -WebSession $session | ConvertTo-Json -Depth 5
} catch {
  Write-Output "Health check failed: $_"
}

Write-Output "Register:"
try {
  $registerBody = @{ email = $email; password = $password } | ConvertTo-Json
  Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -ContentType 'application/json' -Body $registerBody -WebSession $session | ConvertTo-Json
} catch {
  Write-Output "Register failed: $_"
}

Write-Output "Login:"
try {
  $loginBody = @{ email = $email; password = $password } | ConvertTo-Json
  Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody -WebSession $session | ConvertTo-Json
} catch {
  Write-Output "Login failed: $_"
}

Write-Output "CreateHabit:"
try {
  $habit = Invoke-RestMethod -Uri 'http://localhost:3000/api/habits' -Method POST -ContentType 'application/json' -Body '{"name":"E2E Habit","category":"test"}' -WebSession $session
  $habit | ConvertTo-Json
} catch {
  Write-Output "Create habit failed: $_"
}

if ($habit) {
  Write-Output "GetHabits:"
  try {
    Invoke-RestMethod -Uri 'http://localhost:3000/api/habits' -Method GET -WebSession $session | ConvertTo-Json
  } catch {
    Write-Output "Get habits failed: $_"
  }

  Write-Output "Checkin:"
  try {
    Invoke-RestMethod -Uri ("http://localhost:3000/api/habits/$($habit.id)/checkin") -Method POST -ContentType 'application/json' -Body '{"date":"2026-05-27"}' -WebSession $session | ConvertTo-Json
  } catch {
    Write-Output "Checkin failed: $_"
  }

  Write-Output "DeleteHabit:"
  try {
    Invoke-RestMethod -Uri ("http://localhost:3000/api/habits/$($habit.id)") -Method DELETE -WebSession $session | ConvertTo-Json
  } catch {
    Write-Output "Delete habit failed: $_"
  }
} else {
  Write-Output "Skipping habit flow because habit was not created."
}
