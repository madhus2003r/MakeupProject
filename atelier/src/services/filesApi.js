// Artist photo uploads (ID and previous work). Files are stored on the server; only the owner or an admin can view them.
export async function uploadFile(kind,file){
 const fd=new FormData();fd.append('file',file);fd.append('kind',kind)
 let r;try{r=await fetch('/api/files',{method:'POST',credentials:'include',body:fd})}catch{throw new Error('Cannot reach the server.')}
 const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error||'Upload failed');return d.id}
export const fileUrl=id=>'/api/files/'+id
