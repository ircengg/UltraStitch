import { Group, Line, Text, Rect } from "react-konva";
import { useRecoilState } from "recoil";
import { drawingAtom } from "../atom";

export default function Grid() {

    const majorStepMM = 1000;      // major grid every 1000 mm (1 meter)

    const [drawing, setDrawing] = useRecoilState(drawingAtom);



    const vertical = [];
    const horizontal = [];
    const majors = { vx: [], hy: [] };

    // vertical lines
    for (let x = 0; x <= drawing.surfaceWidth; x += drawing.gridStep) {
        vertical.push([x, 0, x, drawing.surfaceHeight]);

        if (x % majorStepMM === 0) {
            majors.vx.push({ x, meters: x / 1000 });
        }
    }

    // horizontal lines
    for (let y = 0; y <= drawing.surfaceHeight; y += drawing.gridStep) {
        horizontal.push([0, y, drawing.surfaceWidth, y]);

        if (y % majorStepMM === 0) {
            majors.hy.push({ y, meters: y / 1000 });
        }
    }


    return (
        <Group listening={false}>
            {/* minor vertical */}
            {vertical.map((pts, i) => (
                <Line
                    key={`v-${i}`}
                    points={pts}
                    stroke="#e6e6e6"
                    strokeWidth={1}
                />
            ))}

            {/* minor horizontal */}
            {horizontal.map((pts, i) => (
                <Line
                    key={`h-${i}`}
                    points={pts}
                    stroke="#e6e6e6"
                    strokeWidth={1}
                />
            ))}

            {/* major vertical */}
            {majors.vx.map((m, i) => (
                <Group key={`mv-${i}`}>
                    <Line
                        points={[m.x, 0, m.x, drawing.surfaceHeight]}
                        stroke="#bdbdbd"
                        strokeWidth={1.5}
                    />
                    <Text
                        x={m.x + 5}
                        y={-5}
                        text={`${m.meters.toFixed(1)} m`}
                        fontSize={drawing.fontSize}
                        fill="#333"
                        rotation={-90}
                    />
                </Group>
            ))}

            {/* major horizontal */}
            {majors.hy.map((m, i) => (
                <Group key={`mh-${i}`}>
                    <Line
                        points={[0, m.y, drawing.surfaceWidth, m.y]}
                        stroke="#bdbdbd"
                        strokeWidth={1.5}
                    />
                    <Text
                        x={5}
                        y={m.y + 12}
                        text={`${m.meters.toFixed(1)} m`}
                        fontSize={drawing.fontSize}
                        fill="#333"
                    />
                </Group>
            ))}
        </Group>
    );
}
