"use client";

import { motion } from "framer-motion";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.!2d139.924!3d35.726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y2D6JGJ55yM5biC5bed5biC5YWr5bmhMi0xNi02!5e0!3m2!1sja!2sjp!4v1";

interface AccessRoute {
  line: string;
  station: string;
  walkTime: string;
}

const ACCESS_ROUTES: AccessRoute[] = [
  {
    line: "JR総武線",
    station: "「本八幡駅」北口",
    walkTime: "徒歩1分",
  },
  {
    line: "都営新宿線",
    station: "「本八幡駅」",
    walkTime: "徒歩3分",
  },
  {
    line: "京成本線",
    station: "「京成八幡駅」",
    walkTime: "徒歩5分",
  },
];

export default function HomeAccess() {
  return (
    <section id="access" className="bg-off-white text-text-dark py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Google Maps */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <iframe
            src={MAPS_EMBED_URL}
            title="THE PICKLE BANG THEORY 所在地"
            className="h-[300px] md:h-[450px] w-full rounded-lg"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.0, ease: EASE }}
          >
            <p className="text-lg font-semibold mb-4">THE PICKLE BANG THEORY</p>
            <div className="space-y-1 text-base leading-relaxed">
              <p>〒272-0021</p>
              <p>千葉県市川市八幡2-16-6 6階</p>
              <p>営業時間：6:00 – 23:00（不定休）</p>
            </div>
          </motion.div>

          {/* Right: Access routes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.0, delay: 0.1, ease: EASE }}
          >
            <ul>
              {ACCESS_ROUTES.map((route, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-text-gray/30"
                >
                  <span>
                    <span className="font-semibold">{route.line}</span>
                    {route.station} —{" "}
                    <span className="text-accent font-semibold">
                      {route.walkTime}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Parking notice */}
            <p className="mt-6 text-text-gray text-sm">
              お車でお越しの方は近隣のコインパーキングをご利用ください。
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
