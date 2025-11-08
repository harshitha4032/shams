Write-Host "Downloading face recognition models..." -ForegroundColor Green

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/weights"
$modelsPath = $PSScriptRoot

if (!(Test-Path -Path $modelsPath)) {
    New-Item -ItemType Directory -Path $modelsPath | Out-Null
}

$models = @(
    "tiny_face_detector_model-shard1",
    "tiny_face_detector_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_recognition_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    "ssd_mobilenetv1_model-weights_manifest.json"
)

foreach ($model in $models) {
    $url = "$baseUrl/$model"
    $output = Join-Path $modelsPath $model
    
    Write-Host "Downloading $model..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "Downloaded $model successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download $model" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "All models downloaded!" -ForegroundColor Green
Write-Host "Saved to: $modelsPath" -ForegroundColor Cyan
