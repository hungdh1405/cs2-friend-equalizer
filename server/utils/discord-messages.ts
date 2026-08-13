// Vietnamese-language template pools for the Discord bot's own channel messages — distinct
// from server/utils/changelog-messages.ts, which is the English-language admin/audit feed
// shown on the website's /changelog page. Placeholders are substituted by
// server/utils/discord-notify.ts using the same `{key}` syntax as changelog.ts's `render()`.
// Picked pseudo-randomly per message so the channel doesn't read like a repetitive bot log.

// Mentions all current Hosts, reminds them to schedule this week's event. Hero/commander
// framing per explicit request ("fighting tones, fighter tones, heroes tones") — a Host is
// the one who "declares battle"/rallies the squad, not just an admin creating a form entry.
export const HOST_REMINDER = [
  '📯 {hosts} ơi, chiến trường tuần này vẫn chưa được khai mở. Hãy tuyên chiến giúp anh em: {link}',
  '⚔️ Chỉ huy {hosts}, binh đoàn đang chờ lệnh xuất quân cho tuần này: {link}',
  '🛡️ {hosts} ơi, chưa có trận chiến nào được lên kế hoạch tuần này. Triệu tập binh đoàn nhé: {link}',
  '📯 Tướng quân {hosts}, đã đến lúc tuyên bố trận chiến tuần này rồi: {link}',
  '🚩 {hosts}, cả binh đoàn đang ngóng lệnh xung trận. Tạo kèo giúp mọi người: {link}',
  '⚔️ Chưa có tiếng kèn xung trận nào tuần này. {hosts} hãy khởi động cuộc chiến: {link}',
  '🛡️ {hosts} ơi, chiến binh đang chờ chỉ huy ra lệnh tập hợp: {link}',
  '📯 Này {hosts}, tuần mới đã đến mà chưa có trận chiến nào được công bố: {link}',
  '🚩 {hosts}, hãy cầm cờ lệnh và mở ra trận chiến cho tuần này: {link}',
  '⚔️ Binh đoàn vẫn đang chờ đợi. {hosts} tuyên chiến giúp anh em nhé: {link}',
  '🛡️ {hosts} ơi, không có chỉ huy ra lệnh thì chiến binh không biết đánh ở đâu: {link}',
  '📯 Nhắc nhẹ chỉ huy {hosts}: kèo tuần này vẫn chưa được khai màn: {link}',
  '🚩 {hosts}, thời điểm xuất quân đang đến gần mà chưa có lệnh nào: {link}',
  '⚔️ Này tướng quân {hosts}, binh đoàn đang chờ bạn tuyên bố ngày giờ chiến đấu: {link}',
  '🛡️ {hosts} ơi, hãy triệu tập chiến binh cho trận đấu tuần này: {link}',
  '📯 Không có lệnh xuất quân, binh đoàn không thể lên đường. {hosts} tạo kèo giúp: {link}',
  '🚩 {hosts}, cả server đang chờ tiếng kèn trận chiến tuần này: {link}',
  '⚔️ Chỉ huy {hosts} ơi, đã đến lúc vẽ ra chiến trường cho tuần này: {link}',
  '🛡️ {hosts}, binh đoàn cần một chỉ huy ra lệnh — tạo sự kiện giúp nhé: {link}',
  '📯 Này {hosts}, mỗi ngày trôi qua là một ngày binh đoàn chưa được triệu tập: {link}',
  '🚩 {hosts} ơi, hãy giương cao ngọn cờ và công bố trận chiến tuần này: {link}',
  '⚔️ Tướng quân {hosts}, thời cơ xuất quân đang chờ lệnh của bạn: {link}',
  '🛡️ {hosts}, chiến binh đang sẵn sàng — chỉ cần bạn ra lệnh tập hợp: {link}',
  '📯 Nhắc {hosts} lần nữa: chưa có trận chiến nào được lên kế hoạch tuần này: {link}',
  '🚩 {hosts} ơi, hãy là người khơi mào cho trận chiến tuần này: {link}',
  '⚔️ Không có kèo thì không có chiến thắng. {hosts} tuyên chiến giúp mọi người: {link}',
  '🛡️ {hosts}, đã đến giờ triệu hồi binh đoàn cho tuần này rồi: {link}',
  '📯 Này chỉ huy {hosts}, chiến trường vẫn im ắng vì chưa có lệnh xuất quân: {link}',
  '🚩 {hosts} ơi, hãy thổi kèn tập hợp chiến binh cho trận đấu tuần này: {link}',
  '⚔️ {hosts}, một chỉ huy giỏi không để binh đoàn chờ đợi lâu — tạo kèo ngay: {link}'
]

// Vote reminders (3x/day) — hero/warrior tone per explicit request, and now the *only*
// recurring channel presence besides the pinned event message itself (per-vote Yes/No
// messages were removed — team feedback that they made the channel too messy; the pinned
// message's own live edit already shows who's in). Every template links to /event ("inform
// the link to see more") since there's no per-vote message to carry that detail anymore.
// URGENT/CLOSE include {mentions} — the specific roster players (linked to a Discord account)
// who haven't voted or declined yet, tagged directly so the reminder reaches exactly who
// still needs to act, never the whole server. If nobody's left to tag, discord-notify.ts
// renders {mentions} as an empty string and sends with allowed_mentions: { parse: [] }.
export const VOTE_REMINDER_URGENT = [
  '⚔️ Chiến trường đang thiếu quân! Mới có {count} chiến binh, cần thêm {remaining} nữa. {mentions} tập hợp ngay: {link}',
  '🛡️ Đội quân chưa đủ sức mạnh để xung trận — thiếu {remaining} người. {mentions} hãy cầm vũ khí lên: {link}',
  '🔥 Tổng động viên! Chỉ mới {count} chiến binh trình diện, cần thêm {remaining} anh hùng nữa: {link}',
  '🚩 Trận chiến tuần này cần thêm {remaining} chiến binh mới đủ quân số. {mentions} đừng để đồng đội đơn độc: {link}',
  '💥 Báo động! Kèo có nguy cơ tan vì thiếu {remaining} người. {mentions} xung trận giúp anh em: {link}',
  '🛡️ Chỉ huy cần thêm {remaining} chiến binh để hoàn thành binh đoàn. {mentions} tham gia ngay: {link}',
  '⚔️ {mentions}, chiến trường đang chờ các bạn — còn thiếu {remaining} suất mới đủ quân: {link}',
  '🔥 Mới {count} người xung phong, còn thiếu {remaining} nữa mới đủ đội hình chiến đấu: {link}',
  '🚩 Kèo này cần một binh đoàn hoàn chỉnh — hiện tại thiếu {remaining} chiến binh. {mentions} vào trận: {link}',
  '💪 {mentions} ơi, đồng đội đang chờ các bạn ra trận. Còn thiếu {remaining} suất: {link}',
  '⚔️ Không có các bạn, trận này khó mà xung trận được. Thiếu {remaining} chiến binh: {link}',
  '🛡️ Liên minh cần thêm sức mạnh — {remaining} chiến binh nữa là đủ quân. {mentions} tham gia: {link}',
  '🔥 Chiến hữu ơi, hàng ngũ vẫn còn trống {remaining} vị trí. {mentions} xin mời nhập trận: {link}',
  '🚩 Tổng cộng mới {count} chiến binh — cần {remaining} anh hùng nữa để ra trận: {link}',
  '💥 {mentions}, quân đoàn đang réo gọi tên bạn. Còn thiếu {remaining} suất mới đủ sức chiến đấu: {link}',
  '⚔️ Trận chiến sắp mất quân số vì thiếu {remaining} người. {mentions} đừng chậm trễ: {link}',
  '🛡️ Cần thêm {remaining} tay súng để hoàn thiện đội hình chiến đấu. {mentions} tham gia ngay: {link}',
  '🔥 Vinh quang đang chờ, nhưng đội hình còn thiếu {remaining} người. {mentions} xung trận: {link}',
  '🚩 {mentions} ơi, đây là lời kêu gọi tập hợp — còn thiếu {remaining} chiến binh: {link}',
  '💪 Một trận chiến lớn cần một đội quân đông đủ. Hiện thiếu {remaining} người. {mentions} góp sức: {link}'
]

export const VOTE_REMINDER_CLOSE = [
  '⚔️ Gần đủ quân rồi! Chỉ còn thiếu {remaining} chiến binh nữa. {mentions} chốt đội hình luôn: {link}',
  '🛡️ Binh đoàn sắp hoàn chỉnh — còn {remaining} suất cuối cùng. {mentions} nhanh tay: {link}',
  '🔥 Chiến thắng đang rất gần, chỉ thiếu {remaining} người nữa thôi! {mentions} vào trận: {link}',
  '🚩 Sắp đủ quân số cho trận chiến! Còn {remaining} vị trí trống. {mentions} lấp đầy đi: {link}',
  '💥 {mentions}, đội quân chỉ còn thiếu {remaining} anh hùng nữa là hoàn chỉnh: {link}',
  '🛡️ Gần chốt đội hình rồi, thiếu đúng {remaining} chiến binh cuối. {mentions} đừng bỏ lỡ: {link}',
  '⚔️ Chặng cuối của cuộc tập hợp — chỉ cần {remaining} người nữa! {mentions} xung trận: {link}',
  '🔥 {count} chiến binh đã sẵn sàng, chỉ thiếu {remaining} nữa là đủ binh đoàn: {link}',
  '🚩 Vinh quang đang vẫy gọi — còn {remaining} suất là đội hình hoàn thiện. {mentions} vào ngay: {link}',
  '💪 Sắp đủ sức mạnh để xung trận, chỉ thiếu {remaining} chiến binh: {link}',
  '🛡️ {mentions}, các bạn là mảnh ghép cuối cùng — chỉ còn thiếu {remaining} người: {link}',
  '⚔️ Đội quân đã gần hoàn chỉnh, còn {remaining} vị trí đang chờ anh hùng: {link}',
  '🔥 Chỉ cần thêm {remaining} chiến binh, trận chiến này chắc chắn diễn ra! {mentions}: {link}',
  '🚩 {mentions} ơi, đừng để binh đoàn thiếu {remaining} người vào giờ chót: {link}',
  '💥 Gần full quân số rồi! Thiếu {remaining} suất cuối để hoàn thiện đội hình: {link}',
  '🛡️ Chiến thắng chỉ còn cách {remaining} chiến binh nữa. {mentions} chốt luôn: {link}',
  '⚔️ {mentions}, hãy là anh hùng lấp đầy {remaining} suất còn thiếu: {link}',
  '🔥 Đội hình chiến đấu sắp hoàn chỉnh, chỉ thiếu {remaining} người: {link}',
  '🚩 Cơ hội cuối để gia nhập binh đoàn — còn {remaining} suất trống: {link}',
  '💪 {mentions}, chỉ còn {remaining} bước nữa là đội quân sẵn sàng ra trận: {link}'
]

export const VOTE_REMINDER_ENOUGH = [
  '🏆 Binh đoàn đã tập hợp đủ {count} chiến binh! Ai muốn gia nhập thêm vẫn luôn được chào đón: {link}',
  '👑 Đội quân đã sẵn sàng ra trận với {count} chiến binh! Xem danh sách tại: {link}',
  '⚔️ Đủ quân số rồi, chiến thắng đang chờ phía trước! Chi tiết: {link}',
  '🛡️ {count} chiến binh đã tập hợp — trận chiến này chắc chắn diễn ra! Xem thêm: {link}',
  '🔥 Đội hình hoàn chỉnh với {count} tay súng! Chuẩn bị tinh thần xung trận: {link}',
  '🚩 Binh đoàn đã đủ sức mạnh để chiến đấu! Ai vào thêm vẫn được hoan nghênh: {link}',
  '🏆 Vinh quang đang gọi tên — {count} chiến binh đã có mặt! Chi tiết tại: {link}',
  '👑 Đội quân {count} người đã tập hợp xong, chỉ còn chờ ngày ra trận: {link}',
  '⚔️ Đủ chiến binh rồi! Trận chiến tuần này chính thức được xác nhận: {link}',
  '🛡️ {count} anh hùng đã sẵn sàng — không còn gì phải lo lắng nữa: {link}',
  '🔥 Binh đoàn đã full quân số! Ai muốn góp mặt thêm vẫn luôn có chỗ: {link}',
  '🚩 Đội hình chiến đấu đã hoàn thiện với {count} chiến binh. Xem tại: {link}',
  '🏆 Chiến thắng đã trong tầm tay với {count} tay súng sẵn sàng! Chi tiết: {link}',
  '👑 Quân đoàn đã tập hợp đầy đủ, giờ chỉ còn chờ hồi kèn xung trận: {link}',
  '⚔️ {count} chiến binh đã điểm danh — đội hình chính thức chốt! Xem thêm: {link}',
  '🛡️ Đủ người cho trận chiến này rồi, cảm ơn tất cả chiến binh đã tham gia: {link}',
  '🔥 Binh đoàn hùng mạnh với {count} người đã sẵn sàng ra trận: {link}',
  '🚩 Đội quân đã đủ sức mạnh, chiến trường đang chờ đón các anh hùng: {link}',
  '🏆 {count} chiến binh, một đội hình đáng gờm đã hình thành! Chi tiết: {link}',
  '👑 Trận chiến tuần này đã có đủ quân, giờ chỉ còn đếm ngày xung trận: {link}'
]

// The ≥10-votes team-split announcement, listing both generated teams. Hero/warrior tone,
// consistent with the reminder pools above (see decisions log #77). Explicit requirement,
// #79: this is a random *suggestion* to help get started, never framed as a final/binding
// decision — who actually ends up playing with whom is up to the group's own luck and
// choices on the day. Every template says so; none present the split as settled.
export const TEAM_READY = [
  '🏆 Đây là gợi ý chia đội hình từ hệ thống, không phải quyết định cuối cùng — ai đấu cùng ai còn tùy duyên và lựa chọn của mọi người:\n{teams}',
  '⚔️ Random ra đội hình cho {count} chiến binh để tham khảo thôi, thực tế thế nào còn do vận số và ý muốn của các bạn:\n{teams}',
  '🛡️ Đội hình dưới đây chỉ là một đề xuất, không ràng buộc gì cả — số phận và lựa chọn của các bạn mới là điều quyết định:\n{teams}',
  '👑 Đây chỉ là gợi ý ngẫu nhiên, ai theo ai còn tùy vào duyên và ý của từng người:\n{teams}',
  '🔥 Hệ thống đề xuất đội hình như sau, nhưng quyết định thật sự vẫn thuộc về vận may và lựa chọn của các bạn:\n{teams}',
  '🚩 Gợi ý chia đội ngẫu nhiên, không phải lệnh bắt buộc — chiến binh vẫn có quyền tự quyết theo ý mình:\n{teams}',
  '🏆 Đội hình này chỉ mang tính tham khảo, không phải chân lý — thật ra ai đánh cùng ai còn tùy cơ duyên:\n{teams}',
  '⚔️ Đây là cách chia ngẫu nhiên cho {count} người để tham khảo thôi, quyết định cuối cùng vẫn nằm ở tay các chiến binh:\n{teams}',
  '🛡️ Gợi ý đội hình dưới đây không bắt buộc — mọi người có thể thay đổi theo lựa chọn riêng:\n{teams}',
  '👑 Random ra vậy thôi, còn ai chơi với ai thật thì tùy duyên số và quyết định của các bạn:\n{teams}',
  '🔥 Đây là đề xuất từ hệ thống, không phải quyết định cuối cùng — vận số sẽ quyết định phần còn lại:\n{teams}',
  '🚩 Chỉ là gợi ý chia đội ngẫu nhiên, không ép buộc ai cả — quyền quyết định vẫn ở các bạn:\n{teams}',
  '🏆 Đội hình gợi ý như sau — giữ nguyên hay đổi lại là lựa chọn của các chiến binh:\n{teams}',
  '⚔️ Hệ thống chỉ đưa ra gợi ý, còn thực tế ra sao phải chờ duyên số và ý muốn của mọi người:\n{teams}',
  '🛡️ Đừng xem đây là quyết định cuối, đây chỉ là gợi ý để anh em tham khảo:\n{teams}',
  '👑 Đội hình ngẫu nhiên chỉ mang tính đề xuất — ai chơi cùng ai là do cơ duyên và lựa chọn của các bạn:\n{teams}',
  '🔥 Gợi ý là vậy, nhưng chọn đi cùng ai vẫn là quyền của từng chiến binh:\n{teams}',
  '🚩 Đây chỉ là một cách chia ngẫu nhiên để tham khảo, không phải quyết định cuối cùng:\n{teams}',
  '🏆 Random đội hình cho {count} chiến binh chỉ để gợi ý thôi, quyết định thật vẫn nằm ở vận số và lựa chọn của các bạn:\n{teams}',
  '⚔️ Gợi ý chia đội — không bắt buộc theo, tùy ý mọi người tự quyết:\n{teams}',
  '🛡️ Đội hình này là đề xuất, không phải lệnh — duyên số và lựa chọn của các bạn mới là quyết định cuối cùng:\n{teams}',
  '👑 Chỉ là gợi ý ngẫu nhiên để anh em tham khảo, thực tế ra sao còn tùy cơ duyên:\n{teams}',
  '🔥 Đề xuất đội hình như sau, nhưng ai đấu cùng ai thật ra vẫn do vận may và lựa chọn của các bạn:\n{teams}',
  '🚩 Đây là gợi ý từ hệ thống, mọi người hoàn toàn có thể tự điều chỉnh theo ý muốn:\n{teams}',
  '🏆 Random đội hình chỉ để tham khảo — quyết định cuối cùng luôn thuộc về các chiến binh:\n{teams}',
  '⚔️ Gợi ý là thế, còn ai thật sự chung team với ai thì để duyên số quyết định:\n{teams}',
  '🛡️ Đội hình dưới đây không phải bắt buộc, chỉ là một gợi ý ngẫu nhiên để tham khảo:\n{teams}',
  '👑 Đây là đề xuất chia đội, không phải quyết định cuối — số phận và lựa chọn của mọi người mới là điều quyết định:\n{teams}',
  '🔥 Chỉ là gợi ý thôi chiến binh, thực tế đấu với ai còn tùy vào duyên và ý muốn của các bạn:\n{teams}',
  '🚩 Đội hình ngẫu nhiên này chỉ mang tính tham khảo, quyết định cuối cùng vẫn nằm ở tay mọi người:\n{teams}'
]

// Some voters aren't linked to a roster Player yet — announced instead of TEAM_READY, and
// naming who needs linking. Stays mostly operational (this is a technical nudge, not hype),
// with a light hero-tone touch for consistency ("chiến binh"/"đội hình" instead of generic
// "người"/"team").
export const NEED_DISCORD_LINK = [
  '⚠️ {hosts} ơi, binh đoàn đã đủ {count} chiến binh nhưng chưa thể chia đội vì thiếu liên kết Discord cho: {names}. Cập nhật giúp nhé.',
  '⚠️ Đủ quân rồi, nhưng {names} chưa có hồ sơ chiến binh trên hệ thống. {hosts} cập nhật giúp để chia đội.',
  '⚠️ {hosts}, cần liên kết Discord ID cho {names} thì mới sắp xếp được đội hình. Giúp cập nhật sớm nhé!',
  '⚠️ Đã đủ {count} chiến binh, nhưng còn thiếu thông tin của {names}. {hosts} vào cập nhật giúp.',
  '⚠️ {hosts} ơi, {names} chưa có Discord ID trong hồ sơ nên chưa thể vào đội hình. Cập nhật giúp nhé.',
  '⚠️ Đủ {count} người tham chiến rồi, nhưng thiếu liên kết cho {names}. {hosts} bổ sung giúp để chia đội.',
  '⚠️ {hosts}, hệ thống cần Discord ID của {names} để sắp xếp đúng vị trí trong đội hình.',
  '⚠️ Sắp có đội hình rồi, chỉ còn thiếu liên kết hồ sơ cho {names}. {hosts} cập nhật giúp nhé.'
]

// A Host canceled the current event — rare, so a smaller pool is fine, same as
// NEED_DISCORD_LINK above. Posted to the channel and the event message is edited to remove
// the vote buttons (see discord-embeds.ts / events/current.delete.ts). "Retreat"/stand-down
// framing rather than hype, matching the mood of a canceled battle.
export const EVENT_CANCELED = [
  '🏳️ Trận chiến tuần này đã bị hủy. Binh đoàn rút quân, hẹn tái chiến tuần sau!',
  '🚩 Chiến dịch tuần này không diễn ra — lệnh xuất quân đã bị hủy bỏ.',
  '🏳️ Host đã hủy trận chiến tuần này. Cất vũ khí, chờ hồi kèn lần sau nhé.',
  '⚔️ Rất tiếc, trận chiến tuần này bị hủy giữa đường. Hẹn gặp lại chiến binh ở kèo sau.',
  '🚩 Sự kiện đã bị hủy bởi Host — không cần tập hợp binh đoàn nữa.',
  '🏳️ Chiến dịch tuần này tạm gác lại. Theo dõi kênh để biết ngày ra trận mới.'
]

// Posted right after a Host creates the week's event — a hype announcement distinct from
// the embed+buttons message itself (same pattern as vote-cast/removed getting their own
// message on top of the live-updating embed). Credits/tags *all* current Hosts — the
// website's shared-PIN create flow doesn't know which specific Host clicked the button, so
// rather than tag no one, every Host gets credited/pinged collectively. Hero/commander tone,
// matching HOST_REMINDER — a Host "declares battle," they don't just fill out a form.
export const EVENT_CREATED = [
  '⚔️ {hosts} đã tuyên chiến! Trận chiến tuần này diễn ra lúc {startsAt}. Chiến binh nào sẵn sàng thì vào vote: {link}',
  '📯 {hosts} vừa ra lệnh xuất quân — {startsAt}! Vào vote để gia nhập binh đoàn: {link}',
  '🚩 Cờ lệnh đã được giương cao! {hosts} công bố trận chiến lúc {startsAt}. Vote ngay: {link}',
  '🛡️ {hosts} đã triệu tập binh đoàn cho {startsAt}! Xung trận cùng nhau, vote tại: {link}',
  '⚔️ Chiến trường đã được mở ra bởi {hosts} — {startsAt}. Chiến binh vào vote ngay: {link}',
  '📯 Tướng quân {hosts} tuyên bố: trận chiến sẽ diễn ra lúc {startsAt}! Vote để tham chiến: {link}',
  '🔥 {hosts} đã thổi kèn xung trận cho {startsAt}! Đừng để binh đoàn thiếu bạn, vote ngay: {link}',
  '🚩 {hosts} chốt ngày ra trận: {startsAt}. Chiến binh nào cũng cần góp mặt, vote tại: {link}',
  '⚔️ Trận chiến tuần này đã được {hosts} ấn định — {startsAt}! Vào vote để nhập ngũ: {link}',
  '🛡️ {hosts} đã lên kế hoạch chiến đấu cho {startsAt}. Chiến binh tập hợp và vote nhé: {link}',
  '📯 Này chiến binh, {hosts} vừa công bố trận chiến lúc {startsAt}! Vote ngay: {link}',
  '🔥 {hosts} đã khai chiến cho tuần này — {startsAt}! Ai sẵn sàng ra trận thì vote: {link}',
  '🚩 Lệnh xuất quân đã ban: {hosts} ấn định {startsAt} là giờ chiến đấu. Vote tại: {link}',
  '⚔️ {hosts} vừa mở ra một trận chiến mới — {startsAt}. Hãy vote để cùng ra trận: {link}',
  '🛡️ Binh đoàn ơi, {hosts} đã chốt giờ xung trận: {startsAt}! Vào vote ngay: {link}',
  '📯 {hosts} tuyên bố chiến dịch tuần này bắt đầu lúc {startsAt}. Chiến binh vote để tham gia: {link}',
  '🔥 Ngọn lửa chiến tranh đã được {hosts} nhóm lên — {startsAt}! Vote ngay để không bị bỏ lại: {link}',
  '🚩 {hosts} đã cắm cờ báo hiệu trận chiến lúc {startsAt}. Chiến binh vào vote: {link}',
  '⚔️ Một trận chiến mới đã được {hosts} khởi xướng — {startsAt}! Xem chi tiết và vote: {link}',
  '🛡️ {hosts} đã sẵn sàng dẫn quân vào {startsAt}. Chiến binh nào theo cùng thì vote nhé: {link}',
  '📯 Này các chiến binh, {hosts} đã tuyên chiến cho {startsAt}! Đăng ký ra trận bằng cách vote: {link}',
  '🔥 {hosts} chốt trận đánh lớn vào {startsAt}! Vào vote để giành một chỗ trong binh đoàn: {link}',
  '🚩 {hosts} đã công bố thời điểm xung trận: {startsAt}. Vote ngay để không lỡ hẹn: {link}',
  '⚔️ Trống trận đã nổi lên nhờ {hosts} — {startsAt} là giờ ra quân! Vote tại: {link}',
  '🛡️ {hosts} đã chuẩn bị chiến trường cho {startsAt}. Chiến binh tập hợp, vote ngay: {link}'
]

// A Host manually arranged Team A / Team B on the website and saved it — distinct from
// TEAM_READY (the auto-generated split, explicitly framed there as "just a suggestion,"
// #79). This one is a real, final decision a Host made on purpose, so the tone is the
// opposite: maximum stakes, honor, and consequence — "make them only want to fight for
// honor, make them very angry if lost," per explicit request. {teamA}/{teamB} render as
// space-separated <@id> mentions (see notifyManualTeamsAnnounced), so every assigned player
// is directly pinged.
export const MANUAL_TEAMS_ANNOUNCED = [
  '⚔️ Đội hình đã được chỉ huy chốt — không còn đường lui!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nChiến đấu vì danh dự — thua trận là nỗi nhục không thể xóa nhòa!',
  '🩸 Trận chiến sinh tử đã được ấn định!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nKẻ thua sẽ phải cúi đầu trước cả binh đoàn. Chiến thắng hoặc chẳng còn gì để nói!',
  '🔥 Đây là đội hình chính thức, không phải trò đùa!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nDanh dự chiến binh đặt lên bàn cân — thua là nhục nhã ê chề!',
  '⚔️ Chỉ huy đã ra quyết định cuối cùng!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nMột trong hai đội sẽ phải nếm mùi thất bại cay đắng. Chiến đấu hết mình vì danh dự!',
  '🩸 Không còn là gợi ý nữa — đây là trận chiến thật sự!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nAi thua sẽ mang nỗi nhục này cả tuần. Đừng để đồng đội thất vọng!',
  '⚔️ Đội hình đã khóa — không thể thay đổi!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nThắng để tự hào, thua để cay đắng suốt tuần. Chiến đấu hết mình!',
  '🔥 Trận chiến danh dự bắt đầu!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nKẻ bại trận sẽ bị cả server nhắc tên. Đừng để điều đó xảy ra với đội mình!',
  '🩸 Máu và mồ hôi sẽ đổ xuống chiến trường!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nChỉ có một đội được vinh danh — còn lại là nỗi nhục ê chề!',
  '⚔️ Lệnh xuất trận đã ban ra, đội hình chính thức!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nThua trận này, đừng vác mặt về khoe chiến tích!',
  '🔥 Đây là trận đấu quyết định danh dự!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nMột đội sẽ bước ra trong vinh quang, đội còn lại chìm trong cay đắng!',
  '🩸 Chiến binh ơi, đã đến lúc chứng minh bản thân!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nThua là nhục, thắng là vinh quang — không có lựa chọn thứ ba!',
  '⚔️ Đội hình được chỉ huy ấn định — không phải chuyện đùa!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nHãy chiến đấu như thể danh dự cả binh đoàn đặt trên vai bạn!',
  '🔥 Không còn random, không còn may rủi — đây là quyết định cuối cùng!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nThua trận này sẽ bị nhắc đi nhắc lại đến tuần sau!',
  '🩸 Hai đội, một trận chiến, chỉ một kẻ chiến thắng!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nĐừng để nỗi nhục thất bại đeo bám bạn cả tuần!',
  '⚔️ Chỉ huy đã lên tiếng — đội hình chính thức có hiệu lực!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nChiến đấu vì danh dự, vì đồng đội, vì chính bản thân mình!',
  '🔥 Trận chiến danh dự chính thức khai màn!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nAi thua sẽ phải trả giá bằng sự xấu hổ suốt tuần này!',
  '🩸 Đội hình đã chốt, chiến trường đã sẵn sàng đổ máu!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nKhông có chỗ cho kẻ yếu đuối — chỉ có danh dự hoặc nhục nhã!',
  '⚔️ Đây là trận chiến thật, không phải để đùa giỡn!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nThua cuộc đồng nghĩa với một tuần bị cả nhóm trêu chọc!',
  '🔥 Quyết định đã đưa ra — không thể rút lại!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nHãy chiến đấu như thể đây là trận cuối cùng của đời chiến binh!',
  '🩸 Danh dự chiến binh đang bị thử thách!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nThua trận, bạn sẽ phải cúi đầu. Thắng trận, bạn sẽ được tôn vinh!',
  '⚔️ Chốt đội hình — giờ chỉ còn chiến đấu để giành vinh quang!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nKẻ thua cuộc sẽ mãi mãi bị nhắc đến trong sự hổ thẹn!',
  '🔥 Không còn là gợi ý — trận chiến đã được ấn định!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nHãy chiến đấu với tất cả sự tự tôn, vì thất bại là điều không thể chấp nhận!',
  '🩸 Cuộc chiến vì danh dự đã được tuyên bố!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nThua trận là một vết nhơ khó gột rửa — hãy chiến đấu hết mình!',
  '⚔️ Trận chiến chính thức, không có đường lui!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nChỉ có chiến thắng mới xứng đáng với danh dự chiến binh!',
  '🔥 Chỉ huy đã ra lệnh — đội hình có hiệu lực ngay!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nAi để đồng đội thất vọng sẽ phải sống trong nỗi hổ thẹn!',
  '🩸 Trận chiến sẽ được nhớ đến — dù là vinh quang hay ô nhục!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nHãy tự quyết định đội mình sẽ được nhắc đến vì điều gì!',
  '⚔️ Đây là lời tuyên chiến chính thức!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nThua trận, bạn sẽ tự hỏi mình đã làm gì sai suốt cả tuần!',
  '🔥 Đội hình cuối cùng đã được công bố!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nChiến đấu như thể cả danh dự binh đoàn phụ thuộc vào bạn — vì đúng là vậy!',
  '🩸 Không còn may rủi, chỉ còn thực lực!\n🛡️ Đội A: {teamA}\n⚔️ Đội B: {teamB}\nThua cuộc là điều không ai muốn nhắc lại. Chiến đấu vì danh dự!',
  '⚔️ Trận chiến danh dự đã được ấn định bởi chỉ huy!\n🛡️ Đội A: {teamA}\n🔥 Đội B: {teamB}\nHãy chứng minh rằng đội mình xứng đáng được vinh danh, không phải chế giễu!'
]
