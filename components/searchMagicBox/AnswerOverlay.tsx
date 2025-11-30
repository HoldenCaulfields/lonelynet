
import React, { useState, useEffect } from 'react';
import { GraphNode, Comment } from '@/types/types';
import { X, Heart, MessageCircle, Send, User, Share2 } from 'lucide-react';

interface AnswerOverlayProps {
  node: GraphNode;
  onClose: () => void;
}

const AnswerOverlay: React.FC<AnswerOverlayProps> = ({ node, onClose }) => {
  const [votes, setVotes] = useState(node.answerData?.votes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>(node.answerData?.comments || []);
  const [newComment, setNewComment] = useState("");

  const handleVote = () => {
    if (!hasVoted) {
      setVotes(prev => prev + 1);
      setHasVoted(true);
    } else {
      setVotes(prev => prev - 1);
      setHasVoted(false);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      text: newComment,
      timestamp: new Date(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=You`
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
  };

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center p-4 pointer-events-auto">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
       
       <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] relative z-10">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
             <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                   {node.answerData?.author[0]}
                </div>
                <div>
                   <h3 className="font-bold text-lg text-gray-900">{node.answerData?.author}</h3>
                   <p className="text-xs text-gray-500">Expert Contributor • 2h ago</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
             {/* Main Answer */}
             <div className="mb-8">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                   {node.answerData?.fullAnswer || node.answerData?.text}
                </p>
             </div>

             {/* Stats Bar */}
             <div className="flex items-center gap-4 mb-8 border-y border-gray-100 py-4">
                <button 
                  onClick={handleVote}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${hasVoted ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                   <Heart size={18} className={hasVoted ? 'fill-current' : ''} />
                   <span className="font-bold">{votes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500 px-4">
                   <MessageCircle size={18} />
                   <span>{comments.length} Comments</span>
                </div>
                <button className="ml-auto p-2 text-gray-400 hover:text-indigo-600">
                   <Share2 size={20} />
                </button>
             </div>

             {/* Comments Section */}
             <div className="space-y-6">
                <h4 className="font-bold text-gray-900">Discussion</h4>
                {comments.length === 0 ? (
                   <p className="text-gray-400 italic">No comments yet. Be the first to verify this answer.</p>
                ) : (
                   comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                         <img 
                           src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} 
                           alt="avatar" 
                           className="w-8 h-8 rounded-full bg-gray-100"
                         />
                         <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="font-bold text-xs text-gray-900">{comment.author}</span>
                               <span className="text-[10px] text-gray-400">Just now</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
             <form onSubmit={handlePostComment} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add to the discussion..."
                  className="flex-1 bg-gray-100 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-lg"
                >
                   <Send size={18} />
                </button>
             </form>
          </div>

       </div>
    </div>
  );
};

export default AnswerOverlay;
