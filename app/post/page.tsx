import PostForm from "../component/PostForm";

export default function PostPage() {
  return (
    <div className=" bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Create a Post</h1>
      <PostForm />
    </div>
  );
}
