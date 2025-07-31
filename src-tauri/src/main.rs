// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

#[tauri::command]
fn save_project_data(data: String, filename: String) -> Result<String, String> {
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
fn load_project_data(filename: String) -> Result<String, String> {
    let app_data_dir = dirs::config_dir()
        .ok_or("Could not find config directory")?
        .join("ProjectManagerPro");
    
    let file_path = app_data_dir.join(filename);
    
    if !file_path.exists() {
        return Ok("{}".to_string()); // Return empty object if file doesn't exist
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn get_app_data_dir() -> Result<String, String> {
    let app_data_dir = dirs::config_dir()
        .ok_or("Could not find config directory")?
        .join("ProjectManagerPro");
    
    Ok(app_data_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn show_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("/select,")
            .arg(&path)
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .output()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        save_project_data,
        load_project_data,
        get_app_data_dir,
        show_in_folder
    ])
        .setup(|_app| {
            // Create app data directory on startup
            if let Some(config_dir) = dirs::config_dir() {
                let app_data_dir = config_dir.join("ProjectManagerPro");
                if !app_data_dir.exists() {
                    let _ = fs::create_dir_all(&app_data_dir);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}