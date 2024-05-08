import { Layout } from "@/components/layout";
import { getProject, getStreamUrl } from "@/services/dubbing";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { languages } from "@/components/languages";

export const Stream = () => {
  const params = useParams<{ id: string }>();
  const [selectedDub, setSelectedDub] = useState<string>("raw");
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);
  const ref = useRef<ReactPlayer | null>(null);

  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 2000 : false, // refetch every 15 seconds
  });

  useEffect(() => {
    if (data && data.status !== "dubbing") {
      setShouldRefetch(false);
    }
  }, [data]);

  const sourceLang = languages.find(l => l.code === data?.source_lang);
  const targetLangs = languages.filter(l =>
    data?.target_languages.includes(l.code)
  );

  return (
    <Layout>
      {data && data.status === "dubbing" && (
        <div>
          <p className="text-center">Video still processing. Please wait.</p>
        </div>
      )}
      {data && data.status === "failed" && (
        <div>
          <p className="text-center">Video dubbing failed</p>
        </div>
      )}
      {data && data.status === "dubbed" && (
        <>
          <div className="max-w-screen-lg mx-auto">
            <ReactPlayer
              playing
              onStart={() => {
                ref.current?.seekTo(playedSeconds, "seconds");
              }}
              ref={ref}
              url={getStreamUrl(data.id, selectedDub)}
              controls
              width={"100%"}
              height={"400px"}
              onProgress={progress => {
                setPlayedSeconds(progress.playedSeconds);
              }}
            />
          </div>
          <div className="flex justify-center pt-4">
            <div className="flex gap-x-2 items-center p-2 flex-wrap bg-zinc-100 rounded-full ">
              <div
                className={`bg-zinc-200 p-3 rounded-full hover:cursor-pointer ${selectedDub === "raw" ? "bg-zinc-400" : "bg-zinc-200"}`}
                onClick={() => {
                  setSelectedDub("raw");
                }}
              >
                <div>
                  {sourceLang ? (
                    <>
                      {sourceLang.countryLogo} {sourceLang.name}
                    </>
                  ) : (
                    <>Source</>
                  )}
                </div>
              </div>
              {targetLangs.map(lang => (
                <div
                  className={`p-3 rounded-full hover:cursor-pointer ${selectedDub === lang.code ? "bg-zinc-400" : "bg-zinc-200"}`}
                  onClick={() => {
                    setSelectedDub(lang.code);
                  }}
                >
                  {lang && (
                    <div>
                      {lang.countryLogo} {lang.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};
