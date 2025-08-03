// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::fs;
use serde_json;

#[tauri::command]
pub fn save_data(data: String, filename: String) -> Result<String, String> {
    let app_data_dir = dirs::config_dir()
        .ok_or("Could not find config directory")?
        .join("ProjectManagerPro");
    
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app directory: {}", e))?;
    }
    
    let file_path = app_data_dir.join(filename);
    fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("Data saved to: {}", file_path.display()))
}

#[tauri::command]
pub fn load_data(filename: String) -> Result<String, String> {
    let app_data_dir = dirs::config_dir()
        .ok_or("Could not find config directory")?
        .join("ProjectManagerPro");
    
    let file_path = app_data_dir.join(filename);
    
    if !file_path.exists() {
        return Ok("{}".to_string());
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_data, load_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}