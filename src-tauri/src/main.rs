// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::fs;
use std::path::Path;
use std::process::Command;

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
fn select_folder() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .arg("-e")
            .arg("POSIX path of (choose folder with prompt \"בחר תיקיה לפרויקט\")")
            .output()
            .map_err(|e| format!("Failed to run AppleScript: {}", e))?;
            
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                Ok(path)
            } else {
                Err("No folder selected".to_string())
            }
        } else {
            Err("User canceled folder selection".to_string())
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows folder dialog using PowerShell
        let output = Command::new("powershell")
            .arg("-Command")
            .arg("Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.Description = 'בחר תיקיה לפרויקט'; $result = $f.ShowDialog(); if ($result -eq 'OK') { $f.SelectedPath }")
            .output()
            .map_err(|e| format!("Failed to run PowerShell: {}", e))?;
            
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                Ok(path)
            } else {
                Err("No folder selected".to_string())
            }
        } else {
            Err("User canceled folder selection".to_string())
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        // Linux folder dialog using zenity
        let output = Command::new("zenity")
            .arg("--file-selection")
            .arg("--directory")
            .arg("--title=בחר תיקיה לפרויקט")
            .output()
            .map_err(|e| format!("Failed to run zenity: {}", e))?;
            
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                Ok(path)
            } else {
                Err("No folder selected".to_string())
            }
        } else {
            Err("User canceled folder selection".to_string())
        }
    }
}

#[tauri::command]
fn open_folder(path: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(format!("Opened folder: {}", path))
}

#[tauri::command]
fn open_whatsapp(phone: String) -> Result<String, String> {
    let clean_number = phone.chars().filter(|c| c.is_digit(10)).collect::<String>();
    
    if clean_number.len() < 9 {
        return Err("Invalid phone number".to_string());
    }
    
    let formatted_number = if clean_number.starts_with('0') {
        format!("972{}", &clean_number[1..])
    } else if clean_number.starts_with("972") {
        clean_number
    } else {
        format!("972{}", clean_number)
    };
    
    let whatsapp_url = format!("https://wa.me/{}", formatted_number);
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&whatsapp_url)
            .spawn()
            .map_err(|e| format!("Failed to open WhatsApp: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", &whatsapp_url])
            .spawn()
            .map_err(|e| format!("Failed to open WhatsApp: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&whatsapp_url)
            .spawn()
            .map_err(|e| format!("Failed to open WhatsApp: {}", e))?;
    }
    
    Ok(format!("Opened WhatsApp for: {}", formatted_number))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_project_data,
            load_project_data,
            get_app_data_dir,
            select_folder,
            open_folder,
            open_whatsapp
        ])
        .setup(|app| {
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