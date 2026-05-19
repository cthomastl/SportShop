param(
    [string]$DbHost     = "localhost",
    [string]$DbPort     = "5432",
    [string]$DbName     = "sportshop",
    [string]$DbUser     = "sportshop",
    [string]$DbPass     = "sportshop"
)

$initSql = Join-Path $PSScriptRoot "init.sql"

docker run --rm `
    -v "${initSql}:/init.sql:ro" `
    -e "PGPASSWORD=$DbPass" `
    postgres:16-alpine `
    psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f /init.sql
