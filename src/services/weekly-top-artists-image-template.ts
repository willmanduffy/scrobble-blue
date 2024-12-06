import { NormalizedWeeklyTopArtist } from "../types/weekly-top-artist";

const ACCENT_COLOR = "#00FFFF"; // Electric blue

export const weeklyTopArtistsImageTemplate = (
  mainArtist: NormalizedWeeklyTopArtist,
  artists: NormalizedWeeklyTopArtist[],
) => `
    <div style="display: flex; height: 100vh; width: 100vw; background: linear-gradient(135deg, #001529 0%, #002847 100%); color: white; font-family: Inter, system-ui, -apple-system, sans-serif; position: relative; overflow: hidden">
        <div style="position: absolute; inset: 0; display: flex; opacity: 0.4; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSIgeD0iMCIgeT0iMCI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')"></div>
        
        <div style="position: absolute; inset: 0; display: flex; background: linear-gradient(45deg, rgba(0, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 255, 255, 0.05) 75%); background-size: 60px 60px; transform: rotate(-15deg) scale(1.5)"></div>
        
        <div style="display: flex; width: 100%; height: 100%; position: relative; z-index: 1">
            <div style="flex: 1; display: flex; flex-direction: column; position: relative">
            ${
              mainArtist
                ? `
                <div style="display: flex; position: relative">
                <div style="position: relative; width: 600px; height: 630px; display: flex">
                    <div style="position: relative; width: 100%; height: 100%; display: flex">
                    <img 
                        src="${mainArtist.image}" 
                        width="600" 
                        height="630" 
                        style="object-fit: cover; filter: grayscale(100%); position: absolute; inset: 0"
                    />
                    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2)); mix-blend-mode: overlay; display: flex"></div>
                    </div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; width: 600px; padding: 40px; background: linear-gradient(to bottom, transparent 0%, rgba(0, 5, 16, 0.95) 100%); display: flex; flex-direction: column; backdrop-filter: blur(10px)">
                    <div style="display: flex; flex-direction: column">
                    <div style="background: linear-gradient(90deg, ${ACCENT_COLOR}, rgba(0, 255, 255, 0.8)); padding: 6px 16px; border-radius: 100px; display: flex; width: 140px; margin-bottom: 16px; justify-content: center; box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); position: relative; z-index: 2">
                        <span style="font-weight: 800; font-size: 16px; letter-spacing: 0.5px; color: #000; white-space: nowrap">TOP ARTIST</span>
                    </div>
                    <div style="display: flex; flex-direction: column">
                        <h1 style="font-size: 48px; margin: 0; font-weight: 800; color: white; text-shadow: 0 0 30px rgba(0, 255, 255, 0.3)">${mainArtist.name}</h1>
                        <p style="font-size: 32px; margin: 12px 0 0; color: rgba(255,255,255,0.8); font-weight: 700">${mainArtist.playcount} plays</p>
                    </div>
                    </div>
                </div>
                </div>
            `
                : ""
            }
            </div>
            <div style="flex: 1; padding: 50px 50px 50px 100px; display: flex; flex-direction: column; position: relative">
            <div style="display: flex; flex-direction: column; flex: 1">
                <div style="display: flex; flex-direction: column; margin-bottom: 65px">
                <h2 style="font-size: 42px; margin: 0 0 5px; font-weight: 800; display: flex; align-items: baseline">
                    <span style="position: relative; display: flex">
                    <span style="position: absolute; top: -5px; left: -10px; right: -10px; bottom: 5px; background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15)); transform: skew(-10deg) rotate(-1deg); display: flex"></span>
                    <span style="background: linear-gradient(90deg, #8B5CF6, #3B82F6, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 48px; margin-right: 15px; padding: 5px; display: flex; position: relative">Top artists</span>
                    </span>
                    <span style="color: rgba(255,255,255,0.7)">of the week</span>
                </h2>
                </div>
                <div style="display: flex; flex-direction: column">
                ${artists
                  .map(
                    (artist, index) => `
                    <div style="margin-bottom: 70px; display: flex; flex-direction: column">
                    <div style="display: flex; flex-direction: column">
                        <h3 style="font-size: 32px; margin: 0; font-weight: 700; display: flex; align-items: center">
                        <span style="color: ${ACCENT_COLOR}; font-weight: 800; margin-right: 12px; text-shadow: 0 0 20px rgba(0, 255, 255, 0.4); font-size: 36px; width: 40px; display: flex; align-items: center">${index + 1}</span>
                        <div style="display: flex; flex-direction: column">
                            <span>${artist.name}</span>
                            <span style="font-size: 20px; margin-top: 4px; color: rgba(255,255,255,0.6); font-weight: 700">${artist.playcount} plays</span>
                        </div>
                        </h3>
                    </div>
                    </div>
                `,
                  )
                  .join("")}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; padding: 0 0 0">
                <span style="font-size: 20px;">
                <span>Powered by </span><span style="color: ${ACCENT_COLOR}; margin-left: 8px"> scrobble.blue</span>
                </span>
            </div>
            </div>
        </div>
    </div>
`;
