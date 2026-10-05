# Generate self-signed SSL certificate for local HTTPS testing (localhost)
$cert = New-SelfSignedCertificate -DnsName "localhost", "127.0.0.1" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
$pwd = ConvertTo-SecureString -String "foodee123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "$PSScriptRoot\localhost.pfx" -Password $pwd
Write-Host "Self-signed certificate generated at $PSScriptRoot\localhost.pfx"
