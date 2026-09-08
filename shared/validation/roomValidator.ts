export function validatePlayerName(name: string): { valid: boolean; error?: string; sanitizedName?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Player name is required.' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Player name cannot be empty.' };
  }
  
  if (trimmed.length > 16) {
    return { valid: false, error: 'Player name must be 16 characters or less.' };
  }
  
  // Basic HTML/script sanitization
  const sanitized = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return { valid: true, sanitizedName: sanitized };
}

export function validateRoomCode(code: string): { valid: boolean; error?: string; formattedCode?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Room code is required.' };
  }
  
  const formatted = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(formatted)) {
    return { valid: false, error: 'Room code must be exactly 6 alphanumeric characters.' };
  }
  
  return { valid: true, formattedCode: formatted };
}
