// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use std::fs;

mod commands;

// Helper function to get app data directory
fn get_app_data_directory() -> Result<std::path::PathBuf, String> {
    dirs::config_dir()
        .ok_or("Could not find config directory".to_string())
        .map(|dir| dir.join("ProjectManagerPro"))
}

#[tauri::command]
fn save_project_data(data: String, filename: String) -> Result<String, String> {
    let app_data_dir = get_app_data_directory()?;
    
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
    let app_data_dir = get_app_data_directory()?;
    let file_path = app_data_dir.join(filename);
    
    if !file_path.exists() {
        return Ok("{}".to_string());
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn get_app_data_dir() -> Result<String, String> {
    let app_data_dir = get_app_data_directory()?;
    Ok(app_data_dir.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_project_data,
            load_project_data,
            get_app_data_dir,
            commands::send_email_native,
            commands::show_item_in_folder,
            commands::open_folder_native,
            commands::open_whatsapp_with_phone,
            commands::make_phone_call
        ])
        .setup(|app| {
            // Create app data directory on startup
            if let Some(config_dir) = dirs::config_dir() {
                let app_data_dir = config_dir.join("ProjectManagerPro");
                if !app_data_dir.exists() {
                    let _ = fs::create_dir_all(&app_data_dir);
                }
            }

            // Handle external links in webview
            if let Some(window) = app.get_window("main") {
                window.on_menu_event(move |_window, event| {
                    println!("got menu event: {:?}", event);
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}