interface MyChatProps {
  textChat?: string;
  imageUrl?: string;
}

export default function MyChat({ textChat, imageUrl }: MyChatProps) {
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
    <div className="w-full flex justify-end">
      <div className="bg-[#7F55B1] max-w-[75%] px-4 py-3 font-medium rounded-2xl rounded-br-sm text-white shadow-sm">
        {bubbleContent}
      </div>
    </div>
  );
}
