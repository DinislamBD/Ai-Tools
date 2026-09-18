import React from 'react';
import {
  Files,
  Scissors,
  Minimize2,
  Stamp,
  Lock,
  RotateCw,
  Image,
  FileCheck,
  FilePlus,
  Share2,
  FileText,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface PDFToolsScreenProps {
  onSelectTool: (toolId: string) => void;
  onBack?: () => void;
}

export const PDFToolsScreen: React.FC<PDFToolsScreenProps> = ({
  onSelectTool,
  onBack,
}) => {
  const tools = [
    {
      id: 'merge_pdf',
      title: 'Merge PDFs',
      desc: 'Combine multiple PDF files into one document',
      icon: <Files size={22} className="text-blue-500" />,
      bg: 'bg-blue-500/10',
    },
    {
      id: 'split_pdf',
      title: 'Split PDF',
      desc: 'Extract pages or split into multiple PDF files',
      icon: <Scissors size={22} className="text-purple-500" />,
      bg: 'bg-purple-500/10',
    },
    {
      id: 'compress_pdf',
      title: 'Compress PDF',
      desc: 'Reduce file size up to 70% while keeping quality',
      icon: <Minimize2 size={22} className="text-emerald-500" />,
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'signature_studio',
      title: 'Digital Signature',
      desc: 'Draw or stamp your signature with Apple Pencil',
      icon: <Stamp size={22} className="text-teal-500" />,
      bg: 'bg-teal-500/10',
    },
    {
      id: 'password_pdf',
      title: 'Protect & Encrypt PDF',
      desc: 'Set 256-bit AES password encryption or unlock',
      icon: <Lock size={22} className="text-rose-500" />,
      bg: 'bg-rose-500/10',
    },
    {
      id: 'convert_images',
      title: 'Convert Images to PDF',
      desc: 'Compile photo gallery captures into crisp PDFs',
      icon: <Image size={22} className="text-amber-500" />,
      bg: 'bg-amber-500/10',
    },
    {
      id: 'fill_forms',
      title: 'Fill & Sign Forms',
      desc: 'Complete interactive PDF form fields & checkboxes',
      icon: <FileCheck size={22} className="text-sky-500" />,
      bg: 'bg-sky-500/10',
    },
    {
      id: 'watermark_pdf',
      title: 'Add Watermark',
      desc: 'Stamp custom opacity text, date, or security stamp',
      icon: <FileText size={22} className="text-indigo-500" />,
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="PDF Tools"
        largeTitle
        subtitle="Professional PDF Utilities Suite"
        onBack={onBack}
        backTitle="Home"
      />

      {/* Grid of Tools */}
      <div className="flex-1 p-4 space-y-2.5">
        {tools.map((tool) => (
          <div
            key={tool.id}
            id={`pdf-tool-${tool.id}`}
            onClick={() => {
              playHaptic('medium');
              onSelectTool(tool.id);
            }}
            className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition active:scale-[0.99] cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${tool.bg} flex items-center justify-center shrink-0`}>
                {tool.icon}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-neutral-900 tracking-tight">
                  {tool.title}
                </h4>
                <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
                  {tool.desc}
                </p>
              </div>
            </div>
            <div className="text-neutral-400 pl-2">
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
