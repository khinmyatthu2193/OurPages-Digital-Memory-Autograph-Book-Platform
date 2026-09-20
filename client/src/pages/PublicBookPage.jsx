import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemoryCard from '../components/public/MemoryCard.jsx';
import MemoryForm from '../components/public/MemoryForm.jsx';
import { publicBookService } from '../services/publicBookService.js';

export default function PublicBookPage() {
  const { username } = useParams();
  const [book, setBook] = useState(null); const [error, setError] = useState(''); const [formOpen, setFormOpen] = useState(false); const [success, setSuccess] = useState(false);
  useEffect(() => { let active = true; publicBookService.getBook(username).then((data) => active && setBook(data)).catch((requestError) => active && setError(requestError.message)); return () => { active = false; }; }, [username]);
  if (error) return <main className="empty-book"><p className="eyebrow">OurPages</p><h1>This OurPages page doesn&apos;t exist.</h1><p>Check the link and try again.</p><Link to="/">Return home</Link></main>;
  if (!book) return <main className="book-page"><div className="book-skeleton" aria-label="Loading memory book"><span /><span /><span /></div></main>;
  const { profile, memories, prompts } = book; const open = profile.memory_book_status === 'open';
  if (success) return <main className="success-book"><span aria-hidden="true">♥</span><p className="eyebrow">Memory saved</p><h1>Your memory has been added.</h1><p>Thank you for leaving a little piece of your story behind.</p><button className="primary-button" onClick={() => setSuccess(false)}>Back to OurPages</button></main>;
  return <main className="book-page"><section className="book-hero">{profile.avatar_url ? <img className="avatar" src={profile.avatar_url} alt="" /> : <div className="avatar fallback" aria-hidden="true">{profile.display_name.charAt(0).toUpperCase()}</div>}<p className="eyebrow">OurPages memory book</p><h1>{profile.display_name}&apos;s OurPages</h1><p className="username">@{profile.username}</p>{profile.bio && <p className="bio">{profile.bio}</p>}<p className="introduction">Leave a little memory behind.</p>{open ? <button className="primary-button" onClick={() => setFormOpen(true)}>Leave a Memory</button> : <p className="status-note">This memory book is currently closed to new messages.</p>}</section><section className="memory-list" aria-labelledby="memories-heading"><div className="section-heading"><p className="eyebrow">Collected with care</p><h2 id="memories-heading">Memories</h2></div>{memories.length ? memories.map((memory) => <MemoryCard key={memory.id} memory={memory} />) : <p className="no-memories">The first memory is waiting to be written.</p>}</section>{formOpen && <MemoryForm username={profile.username} prompts={prompts} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); setSuccess(true); }} />}</main>;
}
