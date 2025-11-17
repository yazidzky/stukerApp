interface TheirChatProps {
  textChat?: string;
  imageUrl?: string;
}

export default function TheirChat({ textChat, imageUrl }: TheirChatProps) {
  const bubbleContent = (
    <>
      {imageUrl && (
        // Use regular img tag for base64 images
        <img
          src={imageUrl}
          alt="Chat image"
          className="w-full max-w-[200px] h-auto rounded-lg mb-2 object-cover"
        />
      )}
      {textChat && <p className="break-words">{textChat}</p>}
    </>
  );

  return (
    <div className="w-full flex justify-start">
      <div className="bg-[#BE9FE1] bg-opacity-70 max-w-[75%] px-4 py-3 font-medium rounded-2xl rounded-bl-sm text-gray-800 shadow-sm">
        {bubbleContent}
      </div>
    </div>
  );
}
