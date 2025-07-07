'use client';

import {
  FileText,
  MousePointerClick,
  Key,
  StickyNote,
} from 'lucide-react';
import {  motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

import React from 'react';

// Animation Components

// Custom hook for typing loop animation
function useTypingLoop(texts, speed = 45, pause = 1100, backspaceSpeed = 18, backspacePause = 350) {
  const [textIdx, setTextIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    let timeout;
    if (!isDeleting) {
      if (charIdx < texts[textIdx].length) {
        timeout = setTimeout(() => setCharIdx(charIdx + 1), speed);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pause);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx(charIdx - 1), backspaceSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setTextIdx((textIdx + 1) % texts.length);
        }, backspacePause);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, textIdx, texts, speed, pause, backspaceSpeed, backspacePause]);

  return texts[textIdx].slice(0, charIdx);
}

// Blinking cursor component
function AnimatedCursor() {
  return (
    <motion.span
      className="inline-block w-3"
      animate={{ opacity: [0, 1, 1, 0, 0] }}
      transition={{ duration: 1.1, repeat: Infinity }}
      style={{
        color: "#b5aaff"
      }}
    >
      |
    </motion.span>
  );
}

// Main animation component (copy/paste this)
export function TypingAnimation() {
  const workflowTitles = [
    "Sync Airtable with Notion",
  ];
  const workflowDescriptions = [
    "Whenever a new record is added in Airtable, sync it automatically with your Notion database for seamless project tracking.",
    "Auto-forward all new Stripe payments to a dedicated Notion page, including customer, amount, and invoice details for each event.",
  ];
  const title = workflowTitles[0];
  const description = useTypingLoop(workflowDescriptions);

  return (
    <div
      className="pointer-events-none select-none"
      style={{
        position: "absolute",   // THIS is the key
        top: 30,
        right: 30,
        width: 220,
        opacity: 0.63,
        filter: "blur(1px)",
        zIndex: 0,
        userSelect: "none"
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <form
        className="flex flex-col gap-2 bg-[#232336]/80 rounded-xl p-3 border border-[#322359]/30"
        style={{ minWidth: 200, maxWidth: 250 }}
        tabIndex={-1}
      >
        <label className="text-xs text-[#b5aaff] mb-1" htmlFor="wf-title">
          Workflow Title
        </label>
        <input
          id="wf-title"
          type="text"
          value={title}
          readOnly
          className="text-[#a78bfa] font-mono text-xs rounded bg-[#222130]/90 px-2 py-1 mb-1 border border-[#8b5cf6]/20 pointer-events-none"
          tabIndex={-1}
        />
        <label className="text-xs text-[#b5aaff] mt-1 mb-1" htmlFor="wf-desc">
          Workflow Description
        </label>
        <div className="relative w-full">
          <pre
            className="text-[#a78bfa] font-mono text-[11px] leading-5 min-h-[36px] bg-[#222130]/90 rounded px-2 py-1 border border-[#8b5cf6]/10 transition-all pointer-events-none whitespace-pre-wrap"
          >
            <span>
              <AnimatedCursor />
              {description}
            </span>
          </pre>
        </div>
      </form>
    </div>
  );
}

function JSONScrollAnimation() {
  // Static example JSON (put your real n8n workflow here if you want)
  const jsonSample = `{
    "nodes": [
      {
        "name": "Trigger",
        "type": "webhook",
        "notes": "Listens for new events"
      },
      {
        "name": "Airtable",
        "type": "integration",
        "notes": "Add row to database"
      },
      {
        "name": "Filter",
        "type": "logic",
        "notes": "Only if email contains 'invoice'"
      },
      {
        "name": "Slack",
        "type": "notification",
        "notes": "Send channel message"
      },
      {
        "name": "Notion",
        "type": "integration",
        "notes": "Sync project info"
      }
    ]
  }`;

  // px height of the visible area and scrollable content
  const visibleHeight = 200;
  const contentLineHeight = 20; // px (matches CSS)
  const totalLines = jsonSample.split("\n").length;
  const totalContentHeight = totalLines * contentLineHeight;

  // How far to scroll (never more than the content)
  const scrollDistance = totalContentHeight - visibleHeight > 0
    ? totalContentHeight - visibleHeight
    : 0;

  // Animation control
  const [scroll, setScroll] = React.useState(0);
  const scrollDuration = 11; // seconds (make longer for slower scroll)

  // Animate the scroll position with requestAnimationFrame
  React.useEffect(() => {
    let frame: number;
    let start: number | null = null;

    function animateScroll(ts: number) {
      if (!start) start = ts;
      const elapsed = (ts - start!) / 1000; // seconds
      // Progress: 0 to 1 to 0 (loop, scroll down then back up)
      let progress = (elapsed % scrollDuration) / scrollDuration;
      // Only scroll down, then instantly jump to top
      setScroll(-scrollDistance * progress);
      frame = requestAnimationFrame(animateScroll);
    }
    frame = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(frame);
  }, [scrollDistance, scrollDuration]);

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 30,
        width: 450,
        opacity: 0.63,
        filter: "blur(1px)",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <div
        style={{
          height: visibleHeight,
          overflow: "hidden",
          background: "#232336E6",
          borderRadius: "14px",
          border: "1px solid #3d246a50",
          boxShadow: "0 2px 24px #8b5cf630",
        }}
      >
        <pre
          className="font-mono text-[#a78bfa]/90 text-xs p-4 pointer-events-none"
          style={{
            margin: 0,
            minWidth: 350,
            maxWidth: 580,
            lineHeight: `${contentLineHeight}px`,
            position: "relative",
            top: scroll,
            transition: "none", // disables browser transition
          }}
        >
          {jsonSample}
        </pre>
      </div>
    </div>
  );
}












function KeyAnimation() {
  // Animated "copied" state
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 950); // Copied for 950ms
    }, 2700); // Every 2.7s, repeat
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        right: 90,
        width: 450,
        zIndex: 0,
        opacity: 0.63,
        filter: "blur(1px)",
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <div className="relative w-full flex flex-col gap-2 bg-[#232336]/85 rounded-xl p-4 border border-[#352865]/40 shadow-[0_2px_24px_#8b5cf630]">
        <label className="text-xs text-[#b5aaff] mb-1">OpenAI API Key</label>
        <div className="relative">
          {/* Animated key highlight */}
          <motion.input
            type="text"
            readOnly
            value="sk-*******************7p4X"
            className="font-mono text-[#a78bfa] text-[13px] bg-[#18181b]/90 px-3 py-2 rounded border border-[#8b5cf6]/15 w-full pointer-events-none"
            animate={copied ? { backgroundColor: "#332353", color: "#d8b4fe" } : { backgroundColor: "#18181b", color: "#a78bfa" }}
            transition={{ duration: 0.19 }}
            style={{
              transitionProperty: "background, color"
            }}
            tabIndex={-1}
          />
          {/* Copy icon animation */}
          <motion.span
            initial={false}
            animate={copied ? { scale: 1.08, opacity: 1, right: 8 } : { scale: 0.97, opacity: 0.47, right: 18 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            className="absolute top-2 right-2 text-[#b5aaff]"
            style={{ pointerEvents: "none" }}
          >
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
              <rect x="7" y="7" width="10" height="13" rx="2.5" stroke="#a78bfa" strokeWidth="1.5" fill="#18181b" />
              <rect x="3" y="3" width="10" height="13" rx="2.5" stroke="#b5aaff" strokeWidth="1.2" opacity="0.25" />
            </svg>
          </motion.span>
          {/* Copied popup */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: -8 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-1/2 -translate-x-1/2 top-1 text-xs text-[#a78bfa] bg-[#232336]/90 px-2 py-0.5 rounded shadow pointer-events-none"
                style={{ whiteSpace: "nowrap" }}
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}








export function StickyNotesAnimation() {
  const notesData = [
    { color: "#2C2733", text: "Transform\nresponse" },
    { color: "#352F42", text: "Add context\nfor AI" },
    { color: "#413A51", text: "Format output\nfor database" },
    { color: "#504562", text: "Human review\nneeded" },
  ];

  const noteCount    = notesData.length;
  const cardStepDelay = 0.17;
  const flyDuration   = 0.44;
  const pause         = 1.33;

  // front/top = order[0], back = order[last]
  const [order, setOrder]         = React.useState([0, 1, 2, 3]);
  const [isFlying, setIsFlying]   = React.useState(false);
  const [cycle, setCycle]         = React.useState(0);
  const [justAddedIdx, setJustAddedIdx] = React.useState<number|null>(null);

  React.useEffect(() => {
    let timers: number[] = [];

    // 1) trigger front card fly
    timers.push(
      window.setTimeout(() => setIsFlying(true), pause * 1000)
    );
    // 2) after fly, recycle it to back
    timers.push(
      window.setTimeout(() => {
        setOrder((prev) => {
          const [first, ...rest] = prev;
          setJustAddedIdx(first);
          return [...rest, first];
        });
        setIsFlying(false);
        setCycle((c) => c + 1);
        // clear marker so it only animates in once
        window.setTimeout(() => setJustAddedIdx(null), 400);
      },
      (pause + flyDuration + cardStepDelay * (noteCount - 1)) * 1000
      )
    );

    return () => timers.forEach((t) => clearTimeout(t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, cycle]);

  // stacking offsets & base blurs
  const offsetStyles = [
    { x: 0,  y:  0, scale: 1.02, blur: 0.63, z: 20 },
    { x: 12, y: 10, scale: 0.98, blur: 1.25, z: 18 },
    { x: 24, y: 20, scale: 0.94, blur: 1.85, z: 16 },
    { x: 36, y: 30, scale: 0.90, blur: 2.45, z: 14 },
  ];

  return (
    <div
      className="pointer-events-none select-none"
      style={{
        position: "absolute",
        top: 50,
        right: 30,
        width: 170,
        height: 162,
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <div className="relative w-[132px] h-[124px]">
        <AnimatePresence>
          {order
            .map((noteIdx, stackIdx) => {
              const style = offsetStyles[stackIdx] || offsetStyles[offsetStyles.length - 1];
              const isFront = stackIdx === 0;
              const isLast  = stackIdx === noteCount - 1;
              const justAdded = justAddedIdx === noteIdx && isLast;

              // compute the target blur for this frame (ensure always positive)
              let targetBlur = isFront
                ? (isFlying ? 0.9 : 0)
                : style.blur;

              // Ensure blur is never negative
              targetBlur = Math.max(0, targetBlur);

              // base animate props (no filter animation to avoid invalid keyframes)
              let animateProps: any = {
                x:     style.x,
                y:     style.y,
                scale: style.scale,
                opacity: 1,
                zIndex:  style.z,
              };
              let transition: any = {
                type: "spring",
                stiffness: 180,
                damping:   22,
                mass:      0.9,
              };

              // 1) front card flying out
              if (isFront && isFlying) {
                animateProps = {
                  ...animateProps,
                  x: style.x + 120,
                  y: style.y - 10,
                  opacity: 0,
                  scale: 1.1,
                };
                targetBlur = 0.9;
                transition = {
                  duration: flyDuration,
                  ease: "easeIn",
                };
              }
              // 2) the others stepping up
              else if (!isFront && isFlying) {
                const next = offsetStyles[stackIdx - 1];
                animateProps = {
                  ...animateProps,
                  x: next.x,
                  y: next.y,
                  scale: next.scale,
                  zIndex: next.z,
                };
                targetBlur = next.blur;
                transition = {
                  duration: 0.35,
                  delay: cardStepDelay * (stackIdx - 1),
                  ease: "easeOut",
                };
              }
              // 3) just‐added back card fading/sliding in
              else if (justAdded) {
                animateProps = {
                  ...animateProps,
                  x: style.x - 32,
                  opacity: 0,
                  scale: style.scale * 0.94,
                  transitionEnd: {
                    opacity: 1,
                    x:       style.x,
                    scale:   style.scale,
                  },
                };
                targetBlur = 2.45;
                transition = {
                  duration: 0.35,
                  delay: 0.05,
                  ease: "easeOut",
                };
              }

              return (
                <motion.div
                  key={`${noteIdx}-${cycle}-${stackIdx}`}
                  initial={{
                    x:      justAdded ? style.x - 32 : style.x,
                    y:      style.y,
                    scale:  justAdded ? style.scale * 0.94 : style.scale,
                    opacity: justAdded ? 0 : 1,
                    zIndex: style.z,
                  }}
                  animate={animateProps}
                  transition={transition}
                  className="absolute w-[120px] h-[117px] flex items-center px-3 py-3"
                  style={{
                    left: 0,
                    top:  0,
                    background: `linear-gradient(135deg, ${notesData[noteIdx].color}80, ${notesData[noteIdx].color}cc)`,
                    borderRadius: "12px",
                    boxShadow: `0 4px 16px ${notesData[noteIdx].color}55`,
                    userSelect: "none",
                    zIndex: style.z,
                    filter: `blur(${Math.max(0, targetBlur)}px)`,
                  }}
                >
                  <span
                    className="font-mono text-[16px] leading-tight"
                    style={{
                      color: "#1c1629",
                      opacity: 1,
                      whiteSpace: "pre-line",
                      lineHeight: "1.22",
                      width: "100%",
                      pointerEvents: "none",
                    }}
                  >
                    {notesData[noteIdx].text}
                  </span>
                  <StickyNote
                    size={14}
                    color="#1c1629"
                    className="absolute bottom-2 right-2 opacity-20"
                  />
                </motion.div>
              );
            })
            .reverse() /* render back→front for correct layering */ }
        </AnimatePresence>
      </div>
    </div>
  );
}










const features = [
  {
    Icon: MousePointerClick,
    name: 'No-code Input',
    description: 'Just type what you need. No node dragging. Ever',
    className: 'lg:col-span-1',
    animation: <TypingAnimation />
  },
  {
    Icon: FileText,
    name: 'Production JSON',
    description: 'Get real, importable n8n JSON files with notes for each node.',
    className: 'lg:col-span-2',
// ...inside features array for "Production JSON"
animation: <JSONScrollAnimation />
  },
  {
    Icon: Key,
    name: 'Use Your API Keys',
    description: 'Bring your own API keys to bypass the Limits.',
    className: 'lg:col-span-2',
    animation: <KeyAnimation />   // <-- Top right, blurred, animated
  },

  {
    Icon: StickyNote,
    name: 'Sticky Notes',
    description: 'Every generated workflow includes visual notes for each node.',
    className: 'lg:col-span-1',
    animation: <StickyNotesAnimation />
  },
];

export default function AnimatedFeatureGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 auto-rows-[22rem]">
      {features.map(({ Icon, name, description, className, animation }) => (
        <div
          key={name}
          className={`
            ${className}
            group
            relative
            bg-[#18181b]
            p-8
            rounded-2xl
            flex
            flex-col
            justify-end
            transition-all
            duration-300
            ease-in-out
            shadow-[0_-20px_80px_-20px_#8b5cf61f_inset]
            overflow-hidden
          `}
        >
          {/* Animated Background */}
          {animation}

          {/* Content */}
          <div className="relative z-10">
            <Icon className="w-12 h-12 text-[#8b5cf6] transition-colors duration-300 ease-in-out mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-neutral-300 mb-3 transition-all duration-300 ease-in-out group-hover:text-[#a78bfa] group-hover:drop-shadow-[0_0_8px_#8b5cf6]">
                {name}
              </h3>
              <p className="text-neutral-400 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 