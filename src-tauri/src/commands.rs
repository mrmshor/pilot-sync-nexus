use std::process::Command;
use tauri::command;

#[command]
pub fn show_item_in_folder(path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try different file managers
        let managers = ["nautilus", "dolphin", "thunar", "nemo"];
        let mut success = false;
        
        for manager in &managers {
            if Command::new(manager)
                .arg("--select")
                .arg(&path)
                .spawn()
                .is_ok()
            {
                success = true;
                break;
            }
        }
        
        if !success {
            return Err("No supported file manager found".to_string());
        }
    }

    Ok("Success".to_string())
}

#[command]
pub fn open_folder_native(path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok("Success".to_string())
}

#[command]
pub fn open_whatsapp_with_phone(phone: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        // Mac - פתיחת WhatsApp Desktop עם מספר טלפון
        let whatsapp_url = format!("whatsapp://send?phone={}", phone);
        match Command::new("open").arg(&whatsapp_url).spawn() {
            Ok(_) => return Ok("WhatsApp opened successfully".to_string()),
            Err(e) => {
                // אם זה לא עבד, נסה לפתוח רק את האפליקציה
                match Command::new("open").args(["-a", "WhatsApp"]).spawn() {
                    Ok(_) => return Ok("WhatsApp app opened".to_string()),
                    Err(e2) => return Err(format!("Failed to open WhatsApp: {} and {}", e, e2)),
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Windows - פתיחת WhatsApp Desktop
        let whatsapp_url = format!("whatsapp://send?phone={}", phone);
        match Command::new("cmd").args(["/c", "start", &whatsapp_url]).spawn() {
            Ok(_) => return Ok("WhatsApp opened successfully".to_string()),
            Err(e) => {
                // אם זה לא עבד, נסה לפתוח רק את האפליקציה
                match Command::new("cmd").args(["/c", "start", "whatsapp:"]).spawn() {
                    Ok(_) => return Ok("WhatsApp app opened".to_string()),
                    Err(e2) => return Err(format!("Failed to open WhatsApp: {} and {}", e, e2)),
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Linux - פתיחת WhatsApp Desktop
        let whatsapp_url = format!("whatsapp://send?phone={}", phone);
        match Command::new("xdg-open").arg(&whatsapp_url).spawn() {
            Ok(_) => return Ok("WhatsApp opened successfully".to_string()),
            Err(e) => {
                // אם זה לא עבד, נסה לפתוח רק את האפליקציה  
                match Command::new("whatsapp-desktop").spawn() {
                    Ok(_) => return Ok("WhatsApp app opened".to_string()),
                    Err(e2) => return Err(format!("Failed to open WhatsApp: {} and {}", e, e2)),
                }
            }
        }
    }

    Ok("Success".to_string())
}