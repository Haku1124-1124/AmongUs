import React, { useMemo, useState } from 'react';
import { CREW_COLORS, CREW_HATS, ROLES_DEF, SPECIAL_ROLE_KEYS } from '../game/constants';
import { getHatThumbnailUrl } from '../game/cosmetics';
import { MAPS_DEF } from '../game/maps';
import { GameSettings, PlayerState } from '../game/rules';

export interface ChatEntry {
  id: string;
  sender: string;
  text: string;
  color: string;
  isGhost: boolean;
}

interface LobbyScreenProps {
  lobbyCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  roomCode: string;
  isHost: boolean;
  isPublicRoom: boolean;
  myId: string;
  myName: string;
  myColor: string;
  myHat: string;
  players: Record<string, PlayerState>;
  settings: GameSettings;
  chatHistory: ChatEntry[];
  onCopyCode: () => void;
  onCopyInvite: () => void;
  onToggleVis: () => void;
  onLeave: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onCustomize: (name: string | null, color: string | null, hat: string | null) => void;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onToggleRole: (roleKey: string) => void;
  onSetAllRoles: (enabled: boolean) => void;
  onOpenRolesGuide: () => void;
  onSendChat: (text: string) => void;
  onStartGame: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  lobbyCanvasRef,
  roomCode,
  isHost,
  isPublicRoom,
  myId,
  myName,
  myColor,
  myHat,
  players,
  settings,
  chatHistory,
  onCopyCode,
  onCopyInvite,
  onToggleVis,
  onLeave,
  onAddBot,
  onRemoveBot,
  onCustomize,
  onUpdateSettings,
  onToggleRole,
  onSetAllRoles,
  onOpenRolesGuide,
  onSendChat,
  onStartGame
}) => {
  const [nameDraft, setNameDraft] = useState(myName);
  const [chatInput, setChatInput] = useState('');
  const hatThumbs = useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of CREW_HATS) {
      map[h.id] = getHatThumbnailUrl(h.id);
    }
    return map;
  }, []);

  const playersArr = Object.values(players);
  const curMap = MAPS_DEF[settings.mapId] || MAPS_DEF.starship;
  const cCur = CREW_COLORS.find((c) => c.id === myColor) || CREW_COLORS[0];
  const hCur = CREW_HATS.find((h) => h.id === myHat) || CREW_HATS[0];

  return (
    <section className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-3">
      <div className="sf-panel rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-400/50 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">ROOM CODE</span>
            <span className="font-orbitron font-black text-lg sm:text-xl text-cyan-300 tracking-widest">
              {roomCode}
            </span>
            <button
              type="button"
              onClick={onCopyCode}
              className="sf-btn px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-xs font-bold"
            >
              📋 コピー
            </button>
          </div>
          <button
            type="button"
            onClick={onCopyInvite}
            className="sf-btn px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 text-xs font-bold"
          >
            🔗 招待URL / メッセージをコピー
          </button>
          {isHost && (
            <button
              type="button"
              onClick={onToggleVis}
              className={`sf-btn px-3 py-2 rounded-xl text-xs font-bold border ${
                isPublicRoom
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/35 border-cyan-400/60 text-cyan-200'
                  : 'bg-rose-500/20 hover:bg-rose-500/35 border-rose-400/60 text-rose-200'
              }`}
            >
              {isPublicRoom ? '🌐 公開ルーム（一覧表示中）' : '🔒 非公開ルーム'}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="sf-btn px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 border border-slate-600 hover:border-rose-500 text-xs font-bold text-slate-200"
        >
          🚪 退出
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[440px]">
        {/* 左：待機デッキ移動キャンバス＆チャット */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="sf-panel rounded-2xl p-2 relative flex-1 min-h-[240px] flex flex-col">
            <div className="text-[11px] text-cyan-300/90 font-bold px-2 py-1 flex flex-wrap justify-between gap-2">
              <span>🛸 待機デッキ（WASDで歩き回ろう）</span>
              <span className="text-amber-300">ステージ: {curMap.name}</span>
              <span className="text-white tabular-nums">{playersArr.length} / 15 人</span>
            </div>
            <div className="relative flex-1 w-full min-h-[200px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <canvas ref={lobbyCanvasRef} className="w-full h-full block" />
            </div>
          </div>

          <div className="sf-panel rounded-2xl p-3 flex flex-col h-44">
            <div className="text-xs font-bold text-slate-300 mb-1.5">💬 ロビーチャット</div>
            <div className="flex-1 overflow-y-auto space-y-1 text-xs mb-2 pr-1">
              {chatHistory
                .filter((m) => !m.isGhost)
                .map((m) => (
                  <div key={m.id} className="leading-snug">
                    <span className="font-bold" style={{ color: m.color }}>
                      {m.sender}:
                    </span>{' '}
                    <span className="text-slate-100">{m.text}</span>
                  </div>
                ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const txt = chatInput.trim();
                if (!txt) return;
                setChatInput('');
                onSendChat(txt);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                maxLength={80}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white"
              />
              <button type="submit" className="sf-btn px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs">
                送信
              </button>
            </form>
          </div>
        </div>

        {/* 右：メンバー一覧・外見変更・ルール設定 */}
        <div className="lg:col-span-5 sf-panel rounded-2xl p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-orbitron text-xs font-bold text-cyan-300">CREW LIST / 参加メンバー</h3>
                {isHost && (
                  <button
                    type="button"
                    onClick={onAddBot}
                    className="sf-btn px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/60 text-indigo-200 text-xs font-bold"
                  >
                    ＋ AIボット追加
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {playersArr.map((p, idx) => {
                  const cObj = CREW_COLORS.find((c) => c.id === p.color) || CREW_COLORS[0];
                  const hObj = CREW_HATS.find((h) => h.id === (p.hat || 'none')) || CREW_HATS[0];
                  const isRoomHost = p.id === myId ? isHost : !isHost && p.id !== myId && !p.isBot && idx === 0;
                  return (
                    <div
                      key={p.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white/60 shrink-0"
                          style={{ background: cObj.hex }}
                        />
                        <span className="text-sm shrink-0" title={hObj.name}>
                          {hObj.icon}
                        </span>
                        <span className="font-bold text-xs text-white truncate">{p.name}</span>
                        {isRoomHost && <span className="text-[10px] text-amber-300 font-bold shrink-0">👑 HOST</span>}
                        {p.isBot && <span className="text-[10px] text-indigo-300 font-bold shrink-0">🤖 AI</span>}
                      </div>
                      {isHost && p.isBot && (
                        <button
                          type="button"
                          onClick={() => onRemoveBot(p.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 shrink-0"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 待機室での外見カスタマイズ */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-orbitron font-bold text-emerald-300">🎨 CREW CUSTOMIZE / 待機室の外見変更</span>
                <span className="text-[11px] text-cyan-300 font-bold">
                  {cCur.name} / {hCur.icon} {hCur.name}
                </span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={10}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onCustomize(nameDraft.trim() || myName, null, null);
                    }
                  }}
                  placeholder="クルー名を変更..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={() => onCustomize(nameDraft.trim() || myName, null, null)}
                  className="sf-btn px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0"
                >
                  名前変更
                </button>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold mb-1">宇宙服カラー（15色）</div>
                <div className="grid grid-cols-8 gap-1">
                  {CREW_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={`ロビーカラー ${c.name}`}
                      onClick={() => onCustomize(null, c.id, null)}
                      className={`sf-btn h-6 rounded-md border-2 ${
                        myColor === c.id ? 'border-white scale-105 shadow' : 'border-slate-700 opacity-80'
                      }`}
                      style={{ background: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold mb-1">頭用装飾品（40種）</div>
                <div className="grid grid-cols-5 gap-1 max-h-28 overflow-y-auto pr-0.5">
                  {CREW_HATS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onCustomize(null, null, h.id)}
                      className={`sf-btn px-1 py-1 rounded-md border text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 ${
                        myHat === h.id
                          ? 'border-amber-400 bg-amber-500/25 text-amber-200'
                          : 'border-slate-700 bg-slate-900/80 text-slate-300'
                      }`}
                      title={h.name}
                    >
                      {hatThumbs[h.id] ? (
                        <img
                          src={hatThumbs[h.id]}
                          alt={h.name}
                          className="w-6 h-6 object-contain pointer-events-none"
                        />
                      ) : (
                        <span>{h.icon}</span>
                      )}
                      <span className="truncate w-full text-center">{h.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ゲームルール＆ステージマップ設定 */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="font-orbitron font-bold text-amber-300">GAME SETTINGS / マップ・ルール設定</div>
              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-1">
                <label htmlFor="setting-map" className="block text-[11px] font-bold text-cyan-300">
                  🗺️ ステージマップ選択（全15マップ）
                </label>
                <select
                  id="setting-map"
                  disabled={!isHost}
                  value={settings.mapId}
                  onChange={(e) => onUpdateSettings({ mapId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-white text-xs"
                >
                  {Object.values(MAPS_DEF).map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      {idx + 1}. {m.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] font-bold text-emerald-300 pt-1">
                  ✨ マップ固有ギミック: {curMap.gimmickSummary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <label htmlFor="setting-impostors" className="text-slate-300">インポスター</label>
                  <select
                    id="setting-impostors"
                    disabled={!isHost}
                    value={settings.impostors}
                    onChange={(e) => onUpdateSettings({ impostors: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-rose-400"
                  >
                    <option value={1}>1人</option>
                    <option value={2}>2人</option>
                    <option value={3}>3人</option>
                  </select>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <label htmlFor="setting-cooldown" className="text-slate-300">キルクール</label>
                  <select
                    id="setting-cooldown"
                    disabled={!isHost}
                    value={settings.killCooldown}
                    onChange={(e) => onUpdateSettings({ killCooldown: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-cyan-300"
                  >
                    <option value={15}>15秒</option>
                    <option value={25}>25秒</option>
                    <option value={35}>35秒</option>
                  </select>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <label htmlFor="setting-spawn-cooldown" className="text-slate-300">スポーン後クール</label>
                  <select
                    id="setting-spawn-cooldown"
                    disabled={!isHost}
                    value={settings.spawnKillCooldown}
                    onChange={(e) => onUpdateSettings({ spawnKillCooldown: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-rose-300"
                  >
                    {[0, 5, 10, 15, 20, 25, 35].map((sec) => (
                      <option key={sec} value={sec}>{sec}秒</option>
                    ))}
                  </select>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <label htmlFor="setting-meeting" className="text-slate-300">会議時間</label>
                  <select
                    id="setting-meeting"
                    disabled={!isHost}
                    value={settings.meetingTime}
                    onChange={(e) => onUpdateSettings({ meetingTime: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-cyan-300"
                  >
                    <option value={45}>45秒</option>
                    <option value={60}>60秒</option>
                    <option value={90}>90秒</option>
                  </select>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">タスク数</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isHost || settings.taskCount <= 1}
                        onClick={() => onUpdateSettings({ taskCount: Math.max(1, settings.taskCount - 1) })}
                        className="sf-btn w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-300 font-black text-xs flex items-center justify-center"
                      >
                        －
                      </button>
                      <span className="font-orbitron font-black text-emerald-300 w-8 text-center">
                        {settings.taskCount}個
                      </span>
                      <button
                        type="button"
                        disabled={!isHost || settings.taskCount >= 8}
                        onClick={() => onUpdateSettings({ taskCount: Math.min(8, settings.taskCount + 1) })}
                        className="sf-btn w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-300 font-black text-xs flex items-center justify-center"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    disabled={!isHost}
                    value={settings.taskCount}
                    onChange={(e) => onUpdateSettings({ taskCount: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5"
                  />
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <label htmlFor="setting-special-roles" className="text-slate-300">特殊役職数</label>
                  <select
                    id="setting-special-roles"
                    disabled={!isHost}
                    value={settings.specialRolesCount}
                    onChange={(e) => onUpdateSettings({ specialRolesCount: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-bold text-purple-300"
                  >
                    <option value={0}>0人（標準）</option>
                    <option value={2}>最大2人</option>
                    <option value={3}>最大3人</option>
                    <option value={5}>最大5人</option>
                    <option value={8}>最大8人</option>
                    <option value={12}>最大12人</option>
                    <option value={15}>全員（最大15人）</option>
                  </select>
                </div>
                <div className="col-span-2 p-2 rounded-xl bg-slate-950/80 border border-purple-500/40 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onOpenRolesGuide}
                    className="sf-btn w-full py-1.5 px-2 rounded-lg bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 font-bold text-xs"
                  >
                    📖 特殊役職一覧＆強さバランス（全20種）
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/40 space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-purple-300">
                    🎭 出現する特殊役職18種（クリックでON/OFF）
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!isHost}
                      onClick={() => onSetAllRoles(true)}
                      className="sf-btn px-1.5 py-0.5 rounded bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-[10px] font-bold"
                    >
                      全ON
                    </button>
                    <button
                      type="button"
                      disabled={!isHost}
                      onClick={() => onSetAllRoles(false)}
                      className="sf-btn px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      全OFF
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-0.5">
                  {SPECIAL_ROLE_KEYS.map((rk) => {
                    const rDef = ROLES_DEF[rk];
                    const isOn = settings.enabledRoles[rk] !== false;
                    const teamBorder =
                      rDef.team === 'impostor'
                        ? 'bg-rose-500/20 border-rose-400/70'
                        : rDef.team === 'neutral'
                        ? 'bg-amber-500/20 border-amber-400/70'
                        : 'bg-cyan-500/20 border-cyan-400/70';
                    return (
                      <button
                        key={rk}
                        type="button"
                        disabled={!isHost}
                        onClick={() => onToggleRole(rk)}
                        title={rDef.balance}
                        className={`sf-btn px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center justify-between gap-1 ${
                          isOn ? `${teamBorder} text-white` : 'bg-slate-900/70 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="truncate">{rDef.jp}</span>
                        <span className={`shrink-0 font-orbitron text-[9px] ${isOn ? 'text-emerald-300' : 'text-slate-600'}`}>
                          {isOn ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            {isHost ? (
              <button
                type="button"
                data-start="true"
                onClick={onStartGame}
                className="sf-btn w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base shadow-[0_0_24px_rgba(52,211,153,0.4)]"
              >
                🚀 ゲーム開始（4人以上推奨・AI補充可）
              </button>
            ) : (
              <p className="text-center text-xs text-cyan-300 font-bold py-2">
                ⏳ ホストがゲームを開始するのを待っています...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
