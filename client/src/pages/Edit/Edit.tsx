import "./Edit.scss";
import { useState, useEffect } from "react";
import { Moment } from "../../types/moment";
import { useParams } from "react-router-dom";
import { Card } from "../../types/card";
import { AiOutlineLoading } from "react-icons/ai";
import { generate } from "../../cohere";

const Edit = () => {
  const [loading, setLoading] = useState(false);
  const { id: rawId } = useParams();
  const id = rawId ? parseInt(rawId) : 0;

  const rawCards: string = localStorage.getItem("cards") ?? "[]";

  if (!rawCards) {
    localStorage.setItem("cards", "[]");
  }

  const cards: Card[] = JSON.parse(rawCards);

  const moments = JSON.parse(localStorage.getItem("moments") as string);

  if (!moments || !moments[id]) {
    localStorage.setItem(
      "moments",
      JSON.stringify([
        {
          name: "Untitled Moment",
          text: "",
          createdDate: new Date().toJSON().slice(0, 10).replace(/-/g, "/"),
        },
      ] as Moment[])
    );
  }
  localStorage.setItem("lastEdited", id.toString());

  const [text, setText] = useState<string>(moments[id].text);
  const [name, setName] = useState<string>(moments[id].name);

  useEffect(() => {
    moments[id].text = text;
    moments[id].name = name;
    localStorage.setItem("moments", JSON.stringify(moments));
  }, [text, name]);

  return (
    <div className="edit">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="name-input"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        placeholder="Type something..."
      />
      {/* <div className='toolbar mb-16 flex-2 mr-20'>
        <div className='flex gap-2'>
          <button>AI-Generate Flashcards</button>
          <button>Create Flashcard</button>
          <button onClick={() => {
            const momentId = createMoment();
            navigate(`/edit/${momentId}`);
            location.reload();            
          }}>New Moment</button>
        </div>
        <button onClick={() => navigate('/moments')}>Back to Moments</button>
      </div> */}
      <button
        className={`mb-8 font-bold text-xl ${loading ? "show no" : "hide"}`}
        onClick={async () => {
          if (!loading) {
            setLoading(true);
            localStorage.setItem(
              "cards",
              JSON.stringify(
                cards.concat(
                  (
                    JSON.parse(
                      (await generate(text)).generations[0].text
                    ) as Card[]
                  ).map((x) => {
                    return { ...x, file: name };
                  })
                )
              )
            );
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        ⚡ Generate Flashcards <AiOutlineLoading />
      </button>
    </div>
  );
};

export default Edit;
