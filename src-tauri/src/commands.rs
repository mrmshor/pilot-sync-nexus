use std::process::Command;
use tauri::command;

#[command]
pub fn send_email_native(email: String, subject: Option<String>, body: Option<String>) -> Result<String, String> {
    // בניית URL mailto מתקדם
    let mut mailto_url = format!("mailto:{}", email);
    let mut params = Vec::new();
    
    if let Some(subj) = subject {
        params.push(format!("subject={}", urlencoding::encode(&subj)));
    }
    
    if let Some(content) = body {
        params.push(format!("body={}", urlencoding::encode(&content)));
    }
    
    if !params.is_empty() {
        mailto_url.push('?');
        mailto_url.push_str(&params.join("&"));
    }
    
    #[cfg(target_os = "macos")]
    {
        match Command::new("open").arg(&mailto_url).spawn() {
            Ok(_) => return Ok("Email client opened successfully".to_string()),
            Err(e) => return Err(format!("Failed to open email client: {}", e)),
        }
    }

    #[cfg(target_os = "windows")]
    {
        match Command::new("cmd").args(["/c", "start", "", &mailto_url]).spawn() {
            Ok(_) => return Ok("Email client opened successfully".to_string()),
            Err(e) => return Err(format!("Failed to open email client: {}", e)),
        }
    }

    #[cfg(target_os = "linux")]
    {
        match Command::new("xdg-open").arg(&mailto_url).spawn() {
            Ok(_) => return Ok("Email client opened successfully".to_string()),
            Err(e) => return Err(format!("Failed to open email client: {}", e)),
        }
    }
}

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
    // נקה ותקן את הנתיב
    let clean_path = path.trim().replace("file://", "");
    
    #[cfg(target_os = "windows")]
    {
        // Windows - תמיכה בנתיבים עם רווחים
        let escaped_path = format!("\"{}\"", clean_path);
        Command::new("explorer")
            .arg(&escaped_path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        // macOS - תמיכה מלאה בנתיבים מקומיים ו-iCloud
        match Command::new("open").arg(&clean_path).spawn() {
            Ok(_) => {},
            Err(e) => {
                // אם הפתיחה נכשלה, נסה להציג במיקום
                match Command::new("open").args(["-R", &clean_path]).spawn() {
                    Ok(_) => {},
                    Err(e2) => return Err(format!("Failed to open folder: {} and {}", e, e2)),
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&clean_path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(format!("Folder opened: {}", clean_path))
}

#[command]
pub fn open_whatsapp_with_phone(phone: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        // Mac - פתיחת WhatsApp Desktop עם מספר טלפון (נסה כמה אופציות)
        let whatsapp_url = format!("whatsapp://send?phone={}", phone);
        
        // נסה תחילה לפתוח עם המספר
        match Command::new("open").arg(&whatsapp_url).spawn() {
            Ok(_) => return Ok("WhatsApp opened with phone number".to_string()),
            Err(_) => {
                // נסה לפתוח את WhatsApp Desktop
                match Command::new("open").args(["-a", "WhatsApp"]).spawn() {
                    Ok(_) => return Ok("WhatsApp Desktop opened".to_string()),
                    Err(_) => {
                        // נסה לפתוח בדפדפן כגיבוי
                        let web_url = format!("https://web.whatsapp.com/send?phone={}", phone);
                        match Command::new("open").arg(&web_url).spawn() {
                            Ok(_) => return Ok("WhatsApp Web opened".to_string()),
                            Err(e) => return Err(format!("Failed to open WhatsApp: {}", e)),
                        }
                    }
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Windows - פתיחת WhatsApp Desktop
        let whatsapp_url = format!("whatsapp://send?phone={}", phone);
        match Command::new("cmd").args(["/c", "start", "", &whatsapp_url]).spawn() {
            Ok(_) => return Ok("WhatsApp opened successfully".to_string()),
            Err(_) => {
                // נסה לפתוח רק את האפליקציה
                match Command::new("cmd").args(["/c", "start", "", "whatsapp:"]).spawn() {
                    Ok(_) => return Ok("WhatsApp app opened".to_string()),
                    Err(_) => {
                        // נסה לפתוח בדפדפן כגיבוי
                        let web_url = format!("https://web.whatsapp.com/send?phone={}", phone);
                        match Command::new("cmd").args(["/c", "start", "", &web_url]).spawn() {
                            Ok(_) => return Ok("WhatsApp Web opened".to_string()),
                            Err(e) => return Err(format!("Failed to open WhatsApp: {}", e)),
                        }
                    }
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
            Err(_) => {
                // נסה לפתוח רק את האפליקציה  
                match Command::new("whatsapp-desktop").spawn() {
                    Ok(_) => return Ok("WhatsApp app opened".to_string()),
                    Err(_) => {
                        // נסה לפתוח בדפדפן כגיבוי
                        let web_url = format!("https://web.whatsapp.com/send?phone={}", phone);
                        match Command::new("xdg-open").arg(&web_url).spawn() {
                            Ok(_) => return Ok("WhatsApp Web opened".to_string()),
                            Err(e) => return Err(format!("Failed to open WhatsApp: {}", e)),
                        }
                    }
                }
            }
        }
    }
}

#[command]
pub fn make_phone_call(phone: String) -> Result<String, String> {
    let tel_url = format!("tel:{}", phone);
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(&tel_url).spawn()
            .map_err(|e| format!("Failed to initiate phone call: {}", e))?;
        return Ok("Phone call initiated successfully".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd").args(["/c", "start", &tel_url]).spawn()
            .map_err(|e| format!("Failed to initiate phone call: {}", e))?;
        return Ok("Phone call initiated successfully".to_string());
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open").arg(&tel_url).spawn()
            .map_err(|e| format!("Failed to initiate phone call: {}", e))?;
        return Ok("Phone call initiated successfully".to_string());
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    Err("Platform not supported for phone calls".to_string())
}