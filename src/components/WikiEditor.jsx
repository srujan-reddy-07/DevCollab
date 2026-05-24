import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useStore } from '../store/store';
import { 
  Bold, Italic, Code, Heading1, Heading2, List, Quote, 
  Undo, Redo, Terminal, Table, Image, Link 
} from 'lucide-react';

export function WikiEditor({ content, onChange, editable = true }) {
  const docs = useStore(state => state.docs);
  const currentProjectId = useStore(state => state.currentProjectId);
  const projectDocs = docs.filter(d => d.projectId === currentProjectId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content updates if it changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Loading Wiki Editor...</div>;
  }

  const handleInsertTable = () => {
    editor.chain().focus().insertContent(`
      <table style="width:100%; border-collapse:collapse; border:1px solid rgba(255,255,255,0.1); margin:1rem 0;">
        <thead>
          <tr style="background:rgba(255,255,255,0.05); color:white;">
            <th style="border:1px solid rgba(255,255,255,0.1); padding:0.5rem; text-align:left;">Header 1</th>
            <th style="border:1px solid rgba(255,255,255,0.1); padding:0.5rem; text-align:left;">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid rgba(255,255,255,0.1); padding:0.5rem; color:hsl(var(--text-secondary));">Cell 1</td>
            <td style="border:1px solid rgba(255,255,255,0.1); padding:0.5rem; color:hsl(var(--text-secondary));">Cell 2</td>
          </tr>
        </tbody>
      </table>
    `).run();
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL (e.g. from Unsplash or generated asset):');
    if (url) {
      editor.chain().focus().insertContent(`<img src="${url}" alt="Wiki Image" style="max-width:100%; border-radius:8px; border:1px solid rgba(255,255,255,0.08); margin:1rem 0; display:block;" />`).run();
    }
  };

  const handleInsertWikiLink = () => {
    if (projectDocs.length === 0) {
      alert('No other wiki pages found in this project!');
      return;
    }
    
    const titles = projectDocs.map(d => `"${d.title}"`).join(', ');
    const targetTitle = prompt(`Which page do you want to link to?\nAvailable: ${titles}`);
    if (targetTitle) {
      const match = projectDocs.find(d => d.title.toLowerCase().includes(targetTitle.toLowerCase()));
      if (match) {
        editor.chain().focus().insertContent(`<a href="#" onclick="window.dispatchEvent(new CustomEvent('wiki-navigate', {detail: '${match.id}'})); return false;" style="color:hsl(var(--primary)); text-decoration:underline;">${match.title}</a>`).run();
      } else {
        alert('No matching page found!');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {editable && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.25rem',
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '0.4rem',
            borderRadius: '6px'
          }}
        >
          {/* Editor Action Buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`glass-button ${editor.isActive('bold') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`glass-button ${editor.isActive('italic') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`glass-button ${editor.isActive('code') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Code Inline"
          >
            <Code size={14} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`glass-button ${editor.isActive('heading', { level: 1 }) ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="H1"
          >
            <Heading1 size={14} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`glass-button ${editor.isActive('heading', { level: 2 }) ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="H2"
          >
            <Heading2 size={14} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`glass-button ${editor.isActive('bulletList') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Bullet List"
          >
            <List size={14} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`glass-button ${editor.isActive('blockquote') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Quote"
          >
            <Quote size={14} />
          </button>

          {/* New Rich Content Buttons */}
          <span style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`glass-button ${editor.isActive('codeBlock') ? 'primary' : ''}`}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Code Block"
          >
            <Terminal size={14} />
          </button>

          <button
            type="button"
            onClick={handleInsertTable}
            className="glass-button"
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Insert Table"
          >
            <Table size={14} />
          </button>

          <button
            type="button"
            onClick={handleInsertImage}
            className="glass-button"
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Insert Image"
          >
            <Image size={14} />
          </button>

          <button
            type="button"
            onClick={handleInsertWikiLink}
            className="glass-button"
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            title="Insert Wiki Link"
          >
            <Link size={14} />
          </button>

          <span style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="glass-button"
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={14} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="glass-button"
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px' }}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={14} />
          </button>
        </div>
      )}
      <div className="wiki-editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
