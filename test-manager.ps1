# Test Manager Login and Endpoints
Write-Output "=== Testing Manager Login ==="

$body = @{email='manager@example.com'; password='Password123'} | ConvertTo-Json
$login = Invoke-WebRequest -Uri 'http://localhost:4000/api/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body
$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.token

Write-Output "Login Response:"
Write-Output ("User: " + $loginData.user.name)
Write-Output ("Role: " + $loginData.user.role)
Write-Output ("Email: " + $loginData.user.email)
Write-Output ("Department: " + $loginData.user.department)

Write-Output "`n=== Testing SUMMARY Endpoint ==="
try {
    $summary = Invoke-WebRequest -Uri 'http://localhost:4000/api/attendance/summary' -Method GET -Headers @{'Authorization'="Bearer $token"}
    $summaryData = $summary.Content | ConvertFrom-Json
    Write-Output $summaryData | ConvertTo-Json -Depth 10
} catch {
    Write-Output "Error: $_"
}

Write-Output "`n=== Testing EMPLOYEES-LIST Endpoint ==="
try {
    $empList = Invoke-WebRequest -Uri 'http://localhost:4000/api/attendance/employees-list' -Method GET -Headers @{'Authorization'="Bearer $token"}
    $empData = $empList.Content | ConvertFrom-Json
    Write-Output "Found $($empData.Length) employees"
    Write-Output ($empData | ConvertTo-Json -Depth 10)
} catch {
    Write-Output "Error: $_"
}
