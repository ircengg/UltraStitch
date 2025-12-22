
import { Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { useRecoilState } from "recoil";
import { drawingAtom, scansAtom, selectedObjectAtom, staticServerAtom, toolbarAtom } from "../atom";
import { useRecoilValue } from "recoil";
import { round } from "../utils";

const ScanImage = ({ scan }) => {
    const static_server_url = useRecoilValue(staticServerAtom);
    const drawing = useRecoilValue(drawingAtom);
    const toolbar = useRecoilValue(toolbarAtom);    
    const [image] = useImage(`${static_server_url}/scans/${encodeURIComponent(scan.id)}.png` || "/heatmap.jpg"); 
    const [selected, setSelected] = useRecoilState(selectedObjectAtom);
    const [scans, setScans] = useRecoilState(scansAtom);

    const isSelected = (selected.type == "scan" && selected?.obj?.id == scan.id)

    // 🟢 Drag move
    const handleDragEnd = (e) => {
        console.log("dragging")
        const node = e.target;
        const scan_ = {
            ...scan,
            x: round(node.x()),
            y: round(node.y()),
            rotation: round(node.rotation()),
            width: round(node.width()),
            height: round(node.height()),
        };

        setScans(prev => prev.map(s => s.id === scan.id ? scan_ : s));
    };

    // 🟢 Transform (resize / rotate)
    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const newWidth = node.width() * scaleX;
        const newHeight = node.height() * scaleY;

        node.scaleX(1);
        node.scaleY(1);
        node.width(newWidth);
        node.height(newHeight);

        const scan_ = {
            ...scan,
            x: round(node.x()),
            y: round(node.y()),
            rotation: round(node.rotation()),
            width: round(newWidth),
            height: round(newHeight)
        };


        setScans(prev => prev.map(s => s.id === scan.id ? scan_ : s));

    };

    const bringToTop = () => {
        let index = scans.findIndex(s => s.id == scan.id);
        if (index != -1) {
            setScans((prev) => {
                const copy = [...prev];
                const [item] = copy.splice(index, 1);
                copy.push(item); // 🔝 move to end = drawn last
                return copy;
            });
        }

    };


    return <>

        {drawing.scanDetailsOn && <Text
            x={scan.x}
            y={scan.y}
            width={scan.width}
            height={scan.height}
            rotation={scan.rotation || 0}
            text={`${scan.x}, ${scan.y} \n\n ${scan.name}\n\n${scan.scan_details}`}
            fontSize={drawing.fontSize}
            fill="black"
            opacity={0.5}
        />}

        <KonvaImage
            id={`scan-${scan.id}`}
            // ref={imgRef}
            image={image}
            x={scan.x}
            y={scan.y}
            width={scan.width || 500}
            height={scan.height || 500}
            rotation={scan.rotation || 0}
            draggable={toolbar.scan_registration_mode && isSelected}
            stroke={isSelected ? "blue" : undefined}
            strokeWidth={10}
            onMouseOver={e => {

            }}
            onClick={(e) => {
                // e.cancelBubble = true;
                setSelected({
                    type: 'scan',
                    obj: scan
                });
                bringToTop()

            }}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            opacity={drawing.scanOpacity / 100}
            // onMouseEnter={onScanHoverIn}
            // onMouseMove={handleMouseMove}
            // onMouseLeave={onScanHoverOut}
            perfectDrawEnabled={false}
        />
    </>
}



export default ScanImage