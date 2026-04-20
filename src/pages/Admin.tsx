import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Loader2, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";

type Status = "new" | "sourcing" | "sourced" | "rejected";
type Suggestion = {
  id: string;
  product_name: string;
  intended_use: string;
  preferred_brand: string | null;
  expected_price: number | null;
  currency: string;
  media_url: string | null;
  media_type: string | null;
  status: Status;
  user_id: string | null;
  created_at: Timestamp | null;
};

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    let unsubSnap: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthed(!!user);
      if (!user) {
        setIsAdmin(false);
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        const admin = adminDoc.exists();
        setIsAdmin(admin);
        if (admin) {
          const q = query(collection(db, "product_suggestions"), orderBy("created_at", "desc"));
          unsubSnap = onSnapshot(
            q,
            (snap) => {
              const rows: Suggestion[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              setItems(rows);
              setLoading(false);
            },
            (err) => {
              console.error(err);
              toast.error("Failed to load suggestions");
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    });
    return () => {
      unsubAuth();
      unsubSnap?.();
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.product_name?.toLowerCase().includes(q) &&
          !(s.preferred_brand?.toLowerCase().includes(q) ?? false) &&
          !s.intended_use?.toLowerCase().includes(q)
        )
          return false;
      }
      if (minPrice && (s.expected_price ?? 0) < Number(minPrice)) return false;
      if (maxPrice && (s.expected_price ?? Infinity) > Number(maxPrice)) return false;
      return true;
    });
  }, [items, statusFilter, search, minPrice, maxPrice]);

  const updateStatus = async (id: string, status: Status) => {
    try {
      await updateDoc(doc(db, "product_suggestions", id), { status });
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  const exportCsv = () => {
    const headers = [
      "id",
      "created_at",
      "product_name",
      "intended_use",
      "preferred_brand",
      "expected_price",
      "currency",
      "status",
      "media_url",
      "user_id",
    ];
    const escape = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        headers
          .map((h) => {
            if (h === "created_at") {
              const ts = r.created_at;
              return escape(ts ? ts.toDate().toISOString() : "");
            }
            return escape((r as any)[h]);
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-suggestions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await fbSignOut(auth);
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Sign in required</h1>
          <p className="text-sm text-muted-foreground">
            Please log in to access the suggestions dashboard.
          </p>
          <Button onClick={() => navigate("/auth")} className="rounded-sm">Go to Sign In</Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-3">
          <ShieldAlert className="w-10 h-10 mx-auto text-destructive" />
          <h1 className="text-xl font-bold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            Your account isn't an admin. Create a Firestore document at
            <code className="mx-1 px-1 rounded bg-muted">admins/&#123;your-uid&#125;</code>
            in the Firebase console to grant access.
          </p>
          <p className="text-xs text-muted-foreground">Your UID: <code>{auth.currentUser?.uid}</code></p>
          <Button variant="outline" onClick={handleSignOut} className="rounded-sm">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<Status, string> = {
    new: "bg-primary/10 text-primary",
    sourcing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    sourced: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Product Suggestions</h1>
            <p className="text-xs text-muted-foreground">
              {filtered.length} of {items.length} submissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-sm">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-sm">Back to site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input placeholder="Search name, brand, use…" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-sm" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="sourcing">Sourcing</SelectItem>
              <SelectItem value="sourced">Sourced</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-sm" />
          <Input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-sm" />
        </div>

        <div className="border rounded-sm bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Use</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No suggestions match your filters yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {s.created_at ? s.created_at.toDate().toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{s.product_name}</TableCell>
                    <TableCell className="text-sm">{s.preferred_brand ?? "—"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {s.expected_price != null ? `${s.currency} ${s.expected_price.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={s.intended_use}>{s.intended_use}</TableCell>
                    <TableCell>
                      {s.media_url ? (
                        <a href={s.media_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs">
                          {s.media_type ?? "file"} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as Status)}>
                        <SelectTrigger className="h-8 rounded-sm w-[120px]">
                          <Badge className={`${statusColors[s.status]} border-0 font-medium`}>{s.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="sourcing">Sourcing</SelectItem>
                          <SelectItem value="sourced">Sourced</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
