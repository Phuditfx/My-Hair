try { fetch('"https://ewyyaxexigubtwhgfhjn.supabase.co"/auth/v1/token').catch(e => console.log(e.message)) } catch(e) { console.log("Catch:", e.message) }
try { fetch('https://ewyyaxexigubtwhgfhjn.supabase.co\n/auth/v1/token').catch(e => console.log(e.message)) } catch(e) { console.log("Catch newline:", e.message) }
