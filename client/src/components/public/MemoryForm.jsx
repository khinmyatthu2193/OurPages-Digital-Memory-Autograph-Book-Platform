import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { publicBookService } from '../../services/publicBookService.js';

const MAX_LENGTH = 2000;
export default function MemoryForm({ username, prompts, onSuccess, onClose }) {
  const [authorName, setAuthorName] = useState(''); const [message, setMessage] = useState(''); const [isAnonymous, setAnonymous] = useState(false); const [promptId, setPromptId] = useState(''); const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false);
  const nameId = useId(); const messageId = useId();
  async function submit(event) {
    event.preventDefault(); setError('');
    if (!message.trim()) return setError('Please write a memory before saving.');
    if (!isAnonymous && !authorName.trim()) return setError('Please add your name or post anonymously.');
    setSubmitting(true);
    try { await publicBookService.submitMemory(username, { authorName, message, isAnonymous, ...(promptId ? { promptId } : {}) }); onSuccess(); }
    catch (submissionError) { setError(submissionError.message); setSubmitting(false); }
  }
  return <div className="modal-backdrop"><section className="memory-modal" role="dialog" aria-modal="true" aria-labelledby="memory-form-title">
    <button className="close-button" type="button" onClick={onClose} aria-label="Close memory form">×</button><p className="eyebrow">A little note for @{username}</p><h2 id="memory-form-title">Leave a memory</h2>
    <form onSubmit={submit}><label htmlFor={nameId}>Your name</label><input id={nameId} value={authorName} maxLength="100" disabled={isAnonymous || submitting} onChange={(e) => setAuthorName(e.target.value)} placeholder="A nickname is welcome" />
      <label className="check-row"><input type="checkbox" checked={isAnonymous} disabled={submitting} onChange={(e) => setAnonymous(e.target.checked)} /> Post anonymously</label>
      <fieldset><legend>Choose a prompt <span>(optional)</span></legend><label className="prompt-option"><input type="radio" name="prompt" value="" checked={!promptId} onChange={() => setPromptId('')} /> Write your own message</label>{prompts.map((prompt) => <label className="prompt-option" key={prompt.id}><input type="radio" name="prompt" value={prompt.id} checked={promptId === prompt.id} onChange={(e) => setPromptId(e.target.value)} /> {prompt.text}</label>)}</fieldset>
      <label htmlFor={messageId}>Your memory</label><textarea id={messageId} value={message} maxLength={MAX_LENGTH} required disabled={submitting} onChange={(e) => setMessage(e.target.value)} placeholder="Write something worth remembering..." />
      <p className="character-count">{message.length} / {MAX_LENGTH}</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={submitting} type="submit">{submitting ? 'Saving your memory...' : 'Save this memory'}</button>
    </form></section></div>;
}
MemoryForm.propTypes = { username: PropTypes.string.isRequired, prompts: PropTypes.array.isRequired, onSuccess: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired };
