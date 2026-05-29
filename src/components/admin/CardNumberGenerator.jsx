const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

/**
 * Generates card number in format: XXXX-XXXX-XXXX-XXXX
 * Block 1: Last 4 digits of CPF
 * Block 2: Month and Year of registration (MMYY)
 * Block 3: Month and Year of expiration (MMYY)
 * Block 4: Inscription number (0001, 0002, etc.)
 */
export function generateCardNumber(cpf, registrationDate, expirationDate, inscriptionNumber) {
  const cleanCpf = cpf.replace(/\D/g, "");
  const block1 = cleanCpf.slice(-4);

  const regDate = new Date(registrationDate);
  const regMonth = String(regDate.getMonth() + 1).padStart(2, "0");
  const regYear = String(regDate.getFullYear()).slice(-2);
  const block2 = regMonth + regYear;

  const expDate = new Date(expirationDate);
  const expMonth = String(expDate.getMonth() + 1).padStart(2, "0");
  const expYear = String(expDate.getFullYear()).slice(-2);
  const block3 = expMonth + expYear;

  const block4 = String(inscriptionNumber).padStart(4, "0");

  return `${block1}-${block2}-${block3}-${block4}`;
}

export async function getNextInscriptionNumber(base44) {
  const allUsers = await db.entities.CardUser.list();
  if (allUsers.length === 0) return 1;
  
  const maxNum = Math.max(...allUsers.map(u => u.inscription_number || 0));
  return maxNum + 1;
}