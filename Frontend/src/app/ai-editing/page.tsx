// "use client";

// import { useState } from "react";
// import { Send, FileText, Sparkles, User, Bot } from "lucide-react";
// import { useAppContext } from "@/context/AppContext";

// export default function AIEditingPage() {
//     const { isPlanUploaded } = useAppContext();
//     const [message, setMessage] = useState("");
//     const [chatHistory, setChatHistory] = useState([
//         { role: "assistant", content: "Bună! Sunt asistentul tău academic. Cum te pot ajuta cu analiza planului de învățământ astăzi?" }
//     ]);

//     const handleSendMessage = () => {
//         if (!message.trim()) return;

//         const newUserMessage = { role: "user", content: message };
//         setChatHistory((prev) => [...prev, newUserMessage]);
//         setMessage("");

//         setTimeout(() => {
//             setChatHistory((prev) => [...prev, {
//                 role: "assistant",
//                 content: "Aceasta este o simulare a răspunsului AI. Când backend-ul va fi gata, aici va apărea analiza reală bazată pe documentele tale."
//             }]);
//         }, 1000);
//     };

//     return (
//         <div className="flex h-full bg-zinc-950 text-zinc-100">

//             <section className="w-1/3 flex flex-col border-r border-zinc-800 bg-zinc-900/50">
//                 <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-semibold">
//                     <div className="flex items-center gap-2">
//                         <Sparkles size={18} className="text-purple-400" />
//                         AI Assistant
//                     </div>
//                     {!isPlanUploaded && (
//                         <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
//                             Fără Plan
//                         </span>
//                     )}
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                     {chatHistory.map((chat, index) => (
//                         <div key={index} className={`flex gap-3 ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
//                             <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${chat.role === "user"
//                                 ? "bg-purple-600 text-white rounded-tr-none"
//                                 : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
//                                 }`}>
//                                 <div className="flex items-center gap-2 mb-1 opacity-50">
//                                     {chat.role === "user" ? <User size={12} /> : <Bot size={12} />}
//                                     <span className="text-[10px] uppercase font-bold tracking-widest">
//                                         {chat.role === "user" ? "Tu" : "AI Assistant"}
//                                     </span>
//                                 </div>
//                                 {chat.content}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="p-4 border-t border-zinc-800 bg-zinc-900">
//                     <div className="relative">
//                         <textarea
//                             value={message}
//                             onChange={(e) => setMessage(e.target.value)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Enter" && !e.shiftKey) {
//                                     e.preventDefault();
//                                     handleSendMessage();
//                                 }
//                             }}
//                             placeholder="Întreabă AI-ul..."
//                             className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[80px] max-h-[200px] resize-none"
//                         />
//                         <button
//                             onClick={handleSendMessage}
//                             className="absolute right-3 bottom-3 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
//                         >
//                             <Send size={16} />
//                         </button>
//                     </div>
//                 </div>
//             </section>

//             <section className="flex-1 flex flex-col bg-black">
//                 <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
//                     <div className="flex items-center gap-2 text-sm font-medium">
//                         <FileText size={16} className="text-zinc-400" />
//                         Preview Document
//                     </div>
//                 </div>

//                 <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:20px_20px]">
//                     <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-12 min-h-[1000px]">
//                         {!isPlanUploaded ? (
//                             <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
//                                 <FileText size={48} className="opacity-20" />
//                                 <p className="text-sm">Niciun document încărcat pentru previzualizare.</p>
//                             </div>
//                         ) : (
//                             <div className="space-y-6">
//                                 <div className="h-8 w-2/3 bg-zinc-800 rounded-md animate-pulse" />
//                                 <div className="space-y-3">
//                                     <div className="h-4 w-full bg-zinc-800/50 rounded" />
//                                     <div className="h-4 w-full bg-zinc-800/50 rounded" />
//                                     <div className="h-4 w-3/4 bg-zinc-800/50 rounded" />
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </section>

//         </div>
//     );
// }

"use client";

import { useAppContext } from "@/context/AppContext";

export default function HomePage() {
    const { isPlanUploaded } = useAppContext();

    return (
        <div className="flex flex-col items-center justify-center h-full p-10">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">AI Academic System</h1>
            <p className="text-zinc-400">
                Status Plan: {isPlanUploaded ? "Încărcat ✅" : "Așteptare document... ⏳"}
            </p>
        </div>
    );
}