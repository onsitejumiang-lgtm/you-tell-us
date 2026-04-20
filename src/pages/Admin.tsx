import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

type Suggestion = {
  id: string;
  product_name: string;
  intended_use: string;
  preferred_brand: string | null;
  expected_price: number | null;
  currency: string;
  media_url: string | null;
  media_type: string | null;
  status: "new" | "sourcing" | "sourced" | "rejected";
  user_id: string | null;
  created_at: string;
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (session) checkRoleAndFetch(session.user.id);
      else {
        setIsAdmin(false);
        setItems([]);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      if (session) checkRoleAndFetch(session.user.id);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRoleAndFetch = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (error) console.error(error);
    const admin = !!data;
    setIsAdmin(admin);
    if (admin) await fetchSuggestions();
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    const { data, error } = await supabase
      .from("product_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load suggestions");
      console.error(error);
      return;
    }
    setItems((data ?? []) as Suggestion[]);
  };

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.product_name.toLowerCase().includes(q) &&
          !(s.preferred_brand?.toLowerCase().includes(q) ?? false) &&
          !s.intended_use.toLowerCase().includes(q)
        )
          return false;
      }
      if (minPrice && (s.expected_price ?? 0) < Number(minPrice)) return false;
      if (maxPrice && (s.expected_price ?? Infinity) > Number(maxPrice)) return false;
      return true;
    });
  }, [items, statusFilter, search, minPrice, maxPrice]);

  const updateStatus = async (id: string, status: Suggestion["status"]) => {
    const { error } = await supabase
      .from("product_suggestions")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error("Update failed");
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success("Status updated");
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
      ...filtered.map((r) => headers.map((h) => escape((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-suggestions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
          <Button onClick={() => navigate("/auth")} className="rounded-sm">
            Go to Sign In
          </Button>
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
            Your account doesn't have admin privileges. Ask a project owner to grant you the
            <code className="mx-1 px-1 rounded bg-muted">admin</code> role in the
            <code className="mx-1 px-1 rounded bg-muted">user_roles</code> table.
          </p>
          <Button variant="outline" onClick={signOut} className="rounded-sm">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<Suggestion["status"], string> = {
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
            <Button variant="ghost" size="sm" onClick={signOut} className="rounded-sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Search name, brand, use…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="sourcing">Sourcing</SelectItem>
              <SelectItem value="sourced">Sourced</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-sm"
          />
          <Input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-sm"
          />
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
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{s.product_name}</TableCell>
                    <TableCell className="text-sm">{s.preferred_brand ?? "—"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {s.expected_price != null
                        ? `${s.currency} ${s.expected_price.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={s.intended_use}>
                      {s.intended_use}
                    </TableCell>
                    <TableCell>
                      {s.media_url ? (
                        <a
                          href={s.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-xs"
                        >
                          {s.media_type ?? "file"} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={s.status}
                        onValueChange={(v) => updateStatus(s.id, v as Suggestion["status"])}
                      >
                        <SelectTrigger className="h-8 rounded-sm w-[120px]">
                          <Badge className={`${statusColors[s.status]} border-0 font-medium`}>
                            {s.status}
                          </Badge>
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
