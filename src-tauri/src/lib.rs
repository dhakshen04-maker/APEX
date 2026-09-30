use std::process::Command;

#[tauri::command]
fn health_check() -> &'static str {
    "APEX desktop shell is running."
}

#[tauri::command]
fn ultron_open(target: String) -> Result<String, String> {
    let value = target.trim();
    if value.is_empty() {
        return Err("Target is empty".into());
    }

    let allowed_apps = [
        ("notepad", "notepad.exe"),
        ("calculator", "calc.exe"),
        ("calc", "calc.exe"),
        ("explorer", "explorer.exe"),
        ("file explorer", "explorer.exe"),
        ("cmd", "cmd.exe"),
        ("powershell", "powershell.exe"),
    ];

    if let Some((_, executable)) = allowed_apps.iter().find(|(name, _)| value.eq_ignore_ascii_case(name)) {
        Command::new(executable)
            .spawn()
            .map_err(|e| format!("Could not open {}: {}", value, e))?;
        return Ok(format!("Opened {}", value));
    }

    Err("This target is not in ULTRON's safe application allowlist yet.".into())
}

#[tauri::command]
fn ultron_open_url(url: String) -> Result<String, String> {
    let value = url.trim();
    if !(value.starts_with("https://") || value.starts_with("http://")) {
        return Err("Only HTTP(S) URLs are allowed.".into());
    }

    #[cfg(target_os = "windows")]
    Command::new("cmd")
        .args(["/C", "start", "", value])
        .spawn()
        .map_err(|e| format!("Could not open URL: {}", e))?;

    Ok(value.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            health_check,
            ultron_open,
            ultron_open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running APEX");
}
